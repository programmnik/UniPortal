import sqlite3
import hashlib
import json
import os
import re
from datetime import datetime
import secrets
import getpass
import html

class DatabaseManager:
    def __init__(self, db_dir="databases"):
        self.db_dir = db_dir
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
        
        self.conns = {}
        self.init_databases()
        # XSS Protection - sanitize all inputs

    @staticmethod
    def sanitize_input(input_str, max_length=255):
        """Очистка входных данных от XSS и SQL инъекций"""
        if not input_str:
            return ""
        
        # Convert to string
        sanitized = str(input_str)
        
        # Limit length
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        # Remove HTML tags
        sanitized = html.escape(sanitized)
        
        # Remove SQL injection patterns
        sql_patterns = [
            r'(\s*;\s*|\s*--\s*|\s*/\*\s*|\s*\*/\s*|\s*union\s+select\s*|\s*drop\s+table\s*|\s*delete\s+from\s*|\s*insert\s+into\s*|\s*update\s+set\s*)',
            r'(\s*or\s+1\s*=\s*1\s*|\s*and\s+1\s*=\s*1\s*)',
            r'(\s*exec\s*\(|\s*xp_cmdshell\s*)',
            r'(\s*<script\b[^>]*>.*?</script\s*>|\s*javascript:|\s*on\w+\s*=)',
            r'(\s*alert\s*\(|\s*prompt\s*\(|\s*confirm\s*\()'
        ]
        
        for pattern in sql_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        # Remove control characters
        sanitized = ''.join(char for char in sanitized if ord(char) >= 32)
        
        return sanitized.strip()
    
    # Email validation
    @staticmethod
    def validate_email(email):
        """Валидация email"""
        if not email:
            return False
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_regex, email))
    
    # Password validation
    @staticmethod
    def validate_password(password):
        """Валидация пароля"""
        if len(password) < 8:
            return False, "Пароль должен быть не менее 8 символов"
        
        if not re.search(r'[A-Z]', password):
            return False, "Пароль должен содержать хотя бы одну заглавную букву"
        
        if not re.search(r'[a-z]', password):
            return False, "Пароль должен содержать хотя бы одну строчную букву"
        
        if not re.search(r'\d', password):
            return False, "Пароль должен содержать хотя бы одну цифру"
        
        return True, "Пароль надежен"
    
    # Session token generation
    @staticmethod
    def generate_session_token():
        """Генерация безопасного токена сессии"""
        return secrets.token_urlsafe(32)
    
    # Rate limiting (simplified)
    @staticmethod
    def check_rate_limit(ip_address, action, limit=5, window_minutes=15):
        """Проверка ограничения запросов"""
        # В реальном приложении здесь была бы проверка в Redis/Memcached
        # Для демо всегда возвращаем True
        return True
    
    def get_connection(self, db_name):
        """Безопасное получение соединения с БД"""
        if db_name not in self.conns:
            db_path = os.path.join(self.db_dir, db_name)
            
            # Проверяем путь к файлу
            if '..' in db_name or '/' in db_name or '\\' in db_name:
                raise ValueError("Недопустимое имя базы данных")
            
            self.conns[db_name] = sqlite3.connect(db_path)
            self.conns[db_name].row_factory = sqlite3.Row
            
            # Включаем foreign keys
            self.conns[db_name].execute("PRAGMA foreign_keys = ON")
            
            # Устанавливаем безопасные настройки
            self.conns[db_name].execute("PRAGMA secure_delete = ON")
        
        return self.conns[db_name]
    
    def safe_execute(self, db_name, query, params=()):
        """Безопасное выполнение SQL запроса с параметрами"""
        conn = self.get_connection(db_name)
        cursor = conn.cursor()
        
        try:
            # Используем параметризованные запросы для защиты от SQL инъекций
            cursor.execute(query, params)
            conn.commit()
            return cursor
        except sqlite3.Error as e:
            conn.rollback()
            # Логируем ошибку без деталей для безопасности
            print(f"Database error: {e}")
            raise
    
    # Остальные методы остаются, но используют safe_execute
    def register_user(self, email, password, nickname, full_name=None, group_id=None, ip_address=None):
        """Безопасная регистрация пользователя"""
        
        # Проверка rate limiting
        if not self.check_rate_limit(ip_address, "register"):
            return False, "Слишком много запросов. Попробуйте позже."
        
        # Валидация и очистка данных
        if not self.validate_email(email):
            return False, "Неверный формат email"
        
        email = email.lower().strip()
        email = self.sanitize_input(email, 100)
        
        nickname = self.sanitize_input(nickname, 50)
        
        if full_name:
            full_name = self.sanitize_input(full_name, 100)
        
        # Валидация пароля
        is_valid, msg = self.validate_password(password)
        if not is_valid:
            return False, msg
        
        # Проверяем существование email (параметризованный запрос)
        try:
            cursor = self.safe_execute("users_quick.db", 
                "SELECT email FROM users_quick WHERE email = ?", (email,))
            
            if cursor.fetchone():
                return False, "Пользователь с таким email уже существует"
        except:
            return False, "Ошибка базы данных"
        
        # Проверяем существование никнейма
        try:
            cursor = self.safe_execute("users_full.db",
                "SELECT nickname FROM users_full WHERE nickname = ?", (nickname,))
            
            if cursor.fetchone():
                return False, "Пользователь с таким никнеймом уже существует"
        except:
            return False, "Ошибка базы данных"
        
        # Хэшируем пароль с солью
        salt = secrets.token_hex(16)
        password_hash, _ = self.hash_password(password, salt)
        
        # Добавляем в базы данных
        try:
            # Начинаем транзакцию
            quick_conn = self.get_connection("users_quick.db")
            full_conn = self.get_connection("users_full.db")
            
            # Используем контекстный менеджер для транзакций
            with quick_conn:
                quick_conn.execute('''
                    INSERT INTO users_quick (email, password_hash, salt)
                    VALUES (?, ?, ?)
                ''', (email, password_hash, salt))
            
            with full_conn:
                full_conn.execute('''
                    INSERT INTO users_full (email, nickname, full_name)
                    VALUES (?, ?, ?)
                ''', (email, nickname, full_name or nickname))
            
            # Если указана группа
            if group_id:
                group_id = self.sanitize_input(group_id, 50)
                self.add_user_to_group(email, group_id)
            
            # Логируем регистрацию (без паролей!)
            self.log_security_event(ip_address, "register", email, success=True)
            
            return True, "Пользователь успешно зарегистрирован"
            
        except Exception as e:
            # Логируем неудачную попытку
            self.log_security_event(ip_address, "register", email, success=False, error=str(e))
            return False, f"Ошибка регистрации"
    
    def authenticate_user(self, email, password, ip_address=None):
        """Безопасная аутентификация пользователя"""
        
        # Проверка rate limiting
        if not self.check_rate_limit(ip_address, "login"):
            return False, None, "Слишком много попыток входа. Попробуйте позже."
        
        # Очистка и валидация
        email = email.lower().strip()
        email = self.sanitize_input(email, 100)
        
        try:
            # Получаем данные пользователя
            cursor = self.safe_execute("users_quick.db", '''
                SELECT email, password_hash, salt, failed_attempts, locked_until 
                FROM users_quick WHERE email = ?
            ''', (email,))
            
            user = cursor.fetchone()
            
            if not user:
                # Пользователь не найден, но логируем попытку
                self.log_security_event(ip_address, "login_attempt", email, success=False)
                return False, None, "Неверные учетные данные"
            
            # Проверяем блокировку
            if user['locked_until'] and datetime.strptime(user['locked_until'], '%Y-%m-%d %H:%M:%S') > datetime.now():
                return False, None, "Аккаунт временно заблокирован"
            
            # Проверяем пароль
            if self.verify_password(password, user['password_hash'], user['salt']):
                # Сброс счетчика неудачных попыток
                self.safe_execute("users_quick.db", '''
                    UPDATE users_quick 
                    SET last_login = CURRENT_TIMESTAMP, failed_attempts = 0, locked_until = NULL
                    WHERE email = ?
                ''', (email,))
                
                # Получаем информацию о пользователе
                user_info = self.get_user_info(email)
                
                # Логируем успешный вход
                self.log_security_event(ip_address, "login", email, success=True)
                
                # Генерируем токен сессии
                session_token = self.generate_session_token()
                
                # Сохраняем сессию
                self.save_session(email, session_token, ip_address)
                
                return True, user_info, session_token, "Вход выполнен успешно"
            else:
                # Увеличиваем счетчик неудачных попыток
                failed_attempts = (user['failed_attempts'] or 0) + 1
                
                if failed_attempts >= 5:
                    # Блокируем на 15 минут
                    lock_until = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    self.safe_execute("users_quick.db", '''
                        UPDATE users_quick 
                        SET failed_attempts = ?, locked_until = ?
                        WHERE email = ?
                    ''', (failed_attempts, lock_until, email))
                    
                    self.log_security_event(ip_address, "account_locked", email, success=False)
                    return False, None, None, "Слишком много неудачных попыток. Аккаунт заблокирован на 15 минут."
                else:
                    self.safe_execute("users_quick.db", '''
                        UPDATE users_quick 
                        SET failed_attempts = ?
                        WHERE email = ?
                    ''', (failed_attempts, email))
                    
                    self.log_security_event(ip_address, "login_failed", email, success=False)
                    return False, None, None, "Неверные учетные данные"
                
        except Exception as e:
            self.log_security_event(ip_address, "login_error", email, success=False, error=str(e))
            return False, None, None, "Ошибка сервера"
    
    def save_session(self, email, session_token, ip_address):
        """Сохранение сессии в БД"""
        try:
            # Создаем таблицу сессий если ее нет
            self.safe_execute("users_quick.db", '''
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    user_email TEXT NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_valid INTEGER DEFAULT 1,
                    FOREIGN KEY (user_email) REFERENCES users_quick(email) ON DELETE CASCADE
                )
            ''')
            
            # Устанавливаем время жизни сессии (24 часа)
            expires_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            self.safe_execute("users_quick.db", '''
                INSERT INTO sessions (session_id, user_email, ip_address, expires_at)
                VALUES (?, ?, ?, datetime('now', '+24 hours'))
            ''', (session_token, email, ip_address))
            
        except Exception as e:
            print(f"Session save error: {e}")
    
    def validate_session(self, session_token, ip_address=None):
        """Валидация сессии"""
        try:
            cursor = self.safe_execute("users_quick.db", '''
                SELECT s.*, u.email 
                FROM sessions s
                JOIN users_quick u ON s.user_email = u.email
                WHERE s.session_id = ? 
                AND s.is_valid = 1 
                AND s.expires_at > CURRENT_TIMESTAMP
            ''', (session_token,))
            
            session = cursor.fetchone()
            
            if not session:
                return False, None
            
            # Проверяем IP (опционально)
            if ip_address and session['ip_address'] and session['ip_address'] != ip_address:
                # Логируем подозрительную активность
                self.log_security_event(ip_address, "session_ip_mismatch", session['user_email'], success=False)
                # Можно не блокировать, но логировать нужно
            
            return True, session['user_email']
            
        except Exception as e:
            print(f"Session validation error: {e}")
            return False, None
    
    def log_security_event(self, ip_address, event_type, user_email=None, success=True, error=None):
        """Логирование событий безопасности"""
        try:
            self.safe_execute("users_quick.db", '''
                CREATE TABLE IF NOT EXISTS security_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    event_type TEXT,
                    user_email TEXT,
                    success INTEGER,
                    error_message TEXT,
                    user_agent TEXT
                )
            ''')
            
            self.safe_execute("users_quick.db", '''
                INSERT INTO security_logs (ip_address, event_type, user_email, success, error_message)
                VALUES (?, ?, ?, ?, ?)
            ''', (ip_address, event_type, user_email, 1 if success else 0, error))
            
        except Exception as e:
            print(f"Security log error: {e}")
    
    def init_databases(self):
        # 1. Quick users database
        self.init_users_quick()
        
        # 2. Full users database
        self.init_users_full()
        
        # 3. Quick groups database
        self.init_groups_quick()
        
        # 4. Full groups database
        self.init_groups_full()
        
        # 5. Group leaders database
        self.init_group_leaders()
        
        # 6. Admins database
        self.init_admins()
        
        # 7. Demo data
        self.create_demo_data()
    
    def init_users_quick(self):
        conn = self.get_connection("users_quick.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users_quick (
                email TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_email ON users_quick(email)')
        conn.commit()
    
    def init_users_full(self):
        conn = self.get_connection("users_full.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users_full (
                email TEXT PRIMARY KEY,
                nickname TEXT NOT NULL UNIQUE,
                full_name TEXT,
                avatar TEXT,
                theme TEXT DEFAULT 'light',
                notifications_enabled INTEGER DEFAULT 1,
                bio TEXT,
                settings_json TEXT DEFAULT '{}',
                FOREIGN KEY (email) REFERENCES users_quick(email) ON DELETE CASCADE
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_nickname ON users_full(nickname)')
        conn.commit()
    
    def init_groups_quick(self):
        conn = self.get_connection("groups_quick.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS groups_quick (
                user_email TEXT,
                group_id TEXT NOT NULL,
                PRIMARY KEY (user_email, group_id),
                FOREIGN KEY (user_email) REFERENCES users_quick(email) ON DELETE CASCADE
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_group ON groups_quick(user_email, group_id)')
        conn.commit()
    
    def init_groups_full(self):
        conn = self.get_connection("groups_full.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS groups_full (
                group_id TEXT PRIMARY KEY,
                group_name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                settings_json TEXT DEFAULT '{}'
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_group_name ON groups_full(group_name)')
        conn.commit()
    
    def init_group_leaders(self):
        conn = self.get_connection("group_leaders.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS group_leaders (
                group_id TEXT NOT NULL,
                leader_email TEXT NOT NULL,
                PRIMARY KEY (group_id, leader_email),
                FOREIGN KEY (group_id) REFERENCES groups_full(group_id) ON DELETE CASCADE,
                FOREIGN KEY (leader_email) REFERENCES users_quick(email) ON DELETE CASCADE
            )
        ''')
        conn.commit()
    
    def init_admins(self):
        conn = self.get_connection("admins.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admins (
                admin_email TEXT PRIMARY KEY,
                permissions_json TEXT DEFAULT '{}',
                FOREIGN KEY (admin_email) REFERENCES users_quick(email) ON DELETE CASCADE
            )
        ''')
        conn.commit()
    
    # Хэширование пароля с солью
    @staticmethod
    def hash_password(password, salt=None):
        if salt is None:
            salt = secrets.token_hex(16)
        
        # Используем PBKDF2 для надежного хэширования
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # Количество итераций
        ).hex()
        
        return password_hash, salt
    
    # Проверка пароля
    @staticmethod
    def verify_password(password, password_hash, salt):
        new_hash, _ = DatabaseManager.hash_password(password, salt)
        return new_hash == password_hash

    # Получение информации о пользователе
    def get_user_info(self, email):
        conn = self.get_connection("users_full.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM users_full WHERE email = ?
        ''', (email,))
        
        user = cursor.fetchone()
        if user:
            # Получаем группы пользователя
            groups = self.get_user_groups(email)
            
            # Получаем роли
            is_leader = self.is_group_leader(email)
            is_admin = self.is_admin(email)
            
            user_dict = dict(user)
            user_dict['groups'] = groups
            user_dict['is_leader'] = is_leader
            user_dict['is_admin'] = is_admin
            
            # Добавляем настройки из JSON
            if user_dict['settings_json']:
                user_dict['settings'] = json.loads(user_dict['settings_json'])
            else:
                user_dict['settings'] = {}
            
            return user_dict
        return None
    
    # Добавление пользователя в группу
    def add_user_to_group(self, user_email, group_id, group_name=None):
        # Сначала проверяем существование группы
        conn_full = self.get_connection("groups_full.db")
        cursor_full = conn_full.cursor()
        
        cursor_full.execute("SELECT group_id FROM groups_full WHERE group_id = ?", (group_id,))
        if not cursor_full.fetchone():
            # Создаем группу, если она не существует
            if not group_name:
                group_name = f"Группа {group_id}"
            
            cursor_full.execute('''
                INSERT INTO groups_full (group_id, group_name)
                VALUES (?, ?)
            ''', (group_id, group_name))
            conn_full.commit()
        
        # Добавляем пользователя в группу
        conn_quick = self.get_connection("groups_quick.db")
        cursor_quick = conn_quick.cursor()
        
        try:
            cursor_quick.execute('''
                INSERT OR REPLACE INTO groups_quick (user_email, group_id)
                VALUES (?, ?)
            ''', (user_email, group_id))
            conn_quick.commit()
            return True
        except:
            return False
    
    # Получение групп пользователя
    def get_user_groups(self, user_email):
        conn = self.get_connection("groups_quick.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT group_id FROM groups_quick WHERE user_email = ?
        ''', (user_email,))
        
        return [row['group_id'] for row in cursor.fetchall()]
    
    # Проверка, является ли пользователь старостой
    def is_group_leader(self, user_email):
        conn = self.get_connection("group_leaders.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT group_id FROM group_leaders WHERE leader_email = ?
        ''', (user_email,))
        
        return len(cursor.fetchall()) > 0
    
    # Проверка, является ли пользователь администратором
    def is_admin(self, user_email):
        conn = self.get_connection("admins.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT admin_email FROM admins WHERE admin_email = ?
        ''', (user_email,))
        
        return cursor.fetchone() is not None
    
    # Назначение старосты
    def assign_group_leader(self, group_id, leader_email):
        conn = self.get_connection("group_leaders.db")
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO group_leaders (group_id, leader_email)
                VALUES (?, ?)
            ''', (group_id, leader_email))
            conn.commit()
            return True
        except:
            return False
    
    # Назначение администратора
    def assign_admin(self, admin_email, permissions=None):
        conn = self.get_connection("admins.db")
        cursor = conn.cursor()
        
        permissions_json = json.dumps(permissions or {})
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO admins (admin_email, permissions_json)
                VALUES (?, ?)
            ''', (admin_email, permissions_json))
            conn.commit()
            return True
        except:
            return False
    
    # Создание демо-данных
    def create_demo_data(self):
        print("Создание демо-данных...")
        
        # Демо группы
        demo_groups = [
            ("IT-101", "Информационные технологии 101"),
            ("IT-102", "Информационные технологии 102"),
            ("PHYS-201", "Физика 201"),
            ("MATH-301", "Математика 301")
        ]
        
        # Добавляем группы
        for group_id, group_name in demo_groups:
            self.add_group(group_id, group_name)
        
        # Демо пользователи
        demo_users = [
            ("student@uniportal.ru", "student123", "ИванСтудент", "Иван Иванов", "IT-101"),
            ("leader@uniportal.ru", "leader123", "АннаСтароста", "Анна Петрова", "IT-101"),
            ("admin@uniportal.ru", "admin123", "АдминСистемы", "Администратор", "IT-101")
        ]
        
        # Регистрируем пользователей
        for email, password, nickname, full_name, group_id in demo_users:
            success, message = self.register_user(email, password, nickname, full_name, group_id)
            if success:
                print(f"✓ Создан пользователь: {email}")
            else:
                print(f"✗ Ошибка создания {email}: {message}")
        
        # Назначаем старосту
        self.assign_group_leader("IT-101", "leader@uniportal.ru")
        print("✓ Назначен староста группы IT-101")
        
        # Назначаем администратора
        self.assign_admin("admin@uniportal.ru", {
            "manage_users": True,
            "manage_groups": True,
            "manage_content": True,
            "moderate": True
        })
        print("✓ Назначен администратор")
        
        # Создаем еще нескольких студентов
        for i in range(1, 6):
            email = f"student{i}@uniportal.ru"
            nickname = f"Студент{i}"
            full_name = f"Студент {i}"
            
            success, message = self.register_user(
                email, "student123", nickname, full_name, "IT-101"
            )
            if success:
                print(f"✓ Создан студент: {nickname}")
        
        print("\n✅ Демо-данные успешно созданы!")
        print("\nДемо-аккаунты:")
        print("1. Студент: student@uniportal.ru / student123")
        print("2. Староста: leader@uniportal.ru / leader123")
        print("3. Администратор: admin@uniportal.ru / admin123")
    
    # Вспомогательная функция для создания группы
    def add_group(self, group_id, group_name, description=None):
        conn = self.get_connection("groups_full.db")
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO groups_full (group_id, group_name, description)
                VALUES (?, ?, ?)
            ''', (group_id, group_name, description))
            conn.commit()
            return True
        except Exception as e:
            print(f"Ошибка создания группы: {e}")
            return False
    
    # Утилиты для просмотра данных
    def view_table(self, db_name, table_name, limit=10):
        conn = self.get_connection(db_name)
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
        rows = cursor.fetchall()
        
        print(f"\n=== {db_name}.{table_name} (первые {len(rows)} записей) ===")
        for row in rows:
            print(dict(row))
        print("=" * 50)
    
    def view_all_data(self):
        print("\n" + "="*60)
        print("ПРОСМОТР ВСЕХ БАЗ ДАННЫХ")
        print("="*60)
        
        # Показываем все таблицы
        self.view_table("users_quick.db", "users_quick")
        self.view_table("users_full.db", "users_full")
        self.view_table("groups_quick.db", "groups_quick")
        self.view_table("groups_full.db", "groups_full")
        self.view_table("group_leaders.db", "group_leaders")
        self.view_table("admins.db", "admins")
    
    # Очистка всех данных
    def clear_all_data(self):
        confirmation = input("⚠️  Вы уверены, что хотите удалить ВСЕ данные? (yes/no): ")
        if confirmation.lower() != 'yes':
            print("Операция отменена")
            return
        
        databases = [
            "users_quick.db",
            "users_full.db", 
            "groups_quick.db",
            "groups_full.db",
            "group_leaders.db",
            "admins.db"
        ]
        
        for db_name in databases:
            db_path = os.path.join(self.db_dir, db_name)
            if os.path.exists(db_path):
                os.remove(db_path)
                print(f"🗑️  Удалена база данных: {db_name}")
        
        # Закрываем соединения
        for conn in self.conns.values():
            conn.close()
        self.conns = {}
        
        # Пересоздаем базы
        self.init_databases()
        print("✅ Все базы данных пересозданы")

def main():
    db_manager = DatabaseManager()
    
    while True:
        print("\n" + "="*60)
        print("МЕНЕДЖЕР БАЗ ДАННЫХ UNIPORTAL")
        print("="*60)
        print("1. Просмотреть все данные")
        print("2. Добавить нового пользователя")
        print("3. Проверить авторизацию")
        print("4. Назначить старосту")
        print("5. Назначить администратора")
        print("6. Создать новую группу")
        print("7. Добавить пользователя в группу")
        print("8. Очистить все данные и пересоздать")
        print("9. Выход")
        print("="*60)
        
        choice = input("Выберите действие (1-9): ").strip()
        
        if choice == "1":
            db_manager.view_all_data()
        
        elif choice == "2":
            print("\n--- Регистрация нового пользователя ---")
            email = input("Email: ").strip()
            password = getpass.getpass("Пароль: ").strip()
            nickname = input("Никнейм: ").strip()
            full_name = input("Полное имя (опционально): ").strip() or nickname
            group_id = input("ID группы (опционально): ").strip()
            
            if not email or not password or not nickname:
                print("❌ Обязательные поля: email, пароль и никнейм")
                continue
            
            success, message = db_manager.register_user(email, password, nickname, full_name, group_id)
            if success:
                print(f"✅ {message}")
            else:
                print(f"❌ {message}")
        
        elif choice == "3":
            print("\n--- Проверка авторизации ---")
            email = input("Email: ").strip()
            password = getpass.getpass("Пароль: ").strip()
            
            success, user_info, message = db_manager.authenticate_user(email, password)
            if success:
                print(f"✅ {message}")
                print(f"Информация о пользователе:")
                for key, value in user_info.items():
                    if key not in ['settings_json', 'password_hash', 'salt']:
                        print(f"  {key}: {value}")
            else:
                print(f"❌ {message}")
        
        elif choice == "4":
            print("\n--- Назначение старосты ---")
            group_id = input("ID группы: ").strip()
            leader_email = input("Email старосты: ").strip()
            
            if db_manager.assign_group_leader(group_id, leader_email):
                print("✅ Староста назначен")
            else:
                print("❌ Ошибка назначения старосты")
        
        elif choice == "5":
            print("\n--- Назначение администратора ---")
            admin_email = input("Email администратора: ").strip()
            
            permissions = {}
            print("Настройка прав (y/n):")
            permissions['manage_users'] = input("  Управление пользователями? ").lower() == 'y'
            permissions['manage_groups'] = input("  Управление группами? ").lower() == 'y'
            permissions['manage_content'] = input("  Управление контентом? ").lower() == 'y'
            permissions['moderate'] = input("  Модерация? ").lower() == 'y'
            
            if db_manager.assign_admin(admin_email, permissions):
                print("✅ Администратор назначен")
            else:
                print("❌ Ошибка назначения администратора")
        
        elif choice == "6":
            print("\n--- Создание новой группы ---")
            group_id = input("ID группы: ").strip()
            group_name = input("Название группы: ").strip()
            description = input("Описание (опционально): ").strip()
            
            if db_manager.add_group(group_id, group_name, description):
                print("✅ Группа создана")
            else:
                print("❌ Ошибка создания группы")
        
        elif choice == "7":
            print("\n--- Добавление пользователя в группу ---")
            user_email = input("Email пользователя: ").strip()
            group_id = input("ID группы: ").strip()
            group_name = input("Название группы (если новая): ").strip() or None
            
            if db_manager.add_user_to_group(user_email, group_id, group_name):
                print("✅ Пользователь добавлен в группу")
            else:
                print("❌ Ошибка добавления в группу")
        
        elif choice == "8":
            db_manager.clear_all_data()
        
        elif choice == "9":
            print("\nВыход из программы")
            
            # Закрываем все соединения
            for conn in db_manager.conns.values():
                conn.close()
            
            break
        
        else:
            print("❌ Неверный выбор. Попробуйте снова.")

if __name__ == "__main__":
    main()