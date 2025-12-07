// Main functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle - общая для всех страниц
    initThemeToggle();
    
    // Mobile menu
    initMobileMenu();
    
    // Preview tabs
    initPreviewTabs();
    
    // Smooth scroll
    initSmoothScroll();
    
    // Social glass effect for main page
    initSocialGlassEffect();
});

// Theme toggle - работает на всех страницах
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeButton = document.getElementById('theme-toggle-button');
    
    if (!themeToggle || !themeButton) return;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    // Toggle theme
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged'));
    });
    
    // Keyboard support
    themeButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            themeToggle.click();
        }
    });
}

// Mobile menu
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!toggle || !navMenu) return;
    
    toggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
        
        const spans = this.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !toggle.contains(e.target)) {
            navMenu.classList.remove('active');
            toggle.classList.remove('active');
            
            const spans = toggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Preview tabs - FIXED chat with mask
function initPreviewTabs() {
    const tabs = document.querySelectorAll('.preview-tab');
    const content = document.getElementById('previewContent');
    
    if (!tabs.length || !content) return;
    
    // Переменные для управления чатом
    let chatInterval = null;
    let isChatActive = false;
    
    // Content templates - каждый раз создаем заново
    const createTemplate = (type) => {
        switch(type) {
            case 'schedule':
                return `
                    <div class="schedule-item">
                        <div class="subject-color" style="background-color: #3b82f6;"></div>
                        <div class="subject-info">
                            <div class="subject-name">Веб-разработка</div>
                            <div class="subject-time">10:00 - 11:30</div>
                        </div>
                        <div class="subject-room">Ауд. 304</div>
                    </div>
                    <div class="schedule-item">
                        <div class="subject-color" style="background-color: #10b981;"></div>
                        <div class="subject-info">
                            <div class="subject-name">Базы данных</div>
                            <div class="subject-time">12:00 - 13:30</div>
                        </div>
                        <div class="subject-room">Ауд. 415</div>
                    </div>
                    <div class="schedule-item">
                        <div class="subject-color" style="background-color: #8b5cf6;"></div>
                        <div class="subject-info">
                            <div class="subject-name">Алгоритмы</div>
                            <div class="subject-time">14:00 - 15:30</div>
                        </div>
                        <div class="subject-room">Ауд. 203</div>
                    </div>
                `;
                
            case 'materials':
                return `
                    <div class="material-item">
                        <div class="material-icon">📚</div>
                        <div class="material-info">
                            <div class="material-name">Веб-разработка</div>
                            <div class="material-progress">
                                <div class="progress-bar" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="material-count">3 файла</div>
                    </div>
                    <div class="material-item">
                        <div class="material-icon">📊</div>
                        <div class="material-info">
                            <div class="material-name">Базы данных</div>
                            <div class="material-progress">
                                <div class="progress-bar" style="width: 40%"></div>
                            </div>
                        </div>
                        <div class="material-count">2 файла</div>
                    </div>
                    <div class="material-item">
                        <div class="material-icon">🧮</div>
                        <div class="material-info">
                            <div class="material-name">Математика</div>
                            <div class="material-progress">
                                <div class="progress-bar" style="width: 90%"></div>
                            </div>
                        </div>
                        <div class="material-count">5 файлов</div>
                    </div>
                `;
                
            case 'chat':
                return `
                    <div class="chat-wrapper">
                        <!-- Маска для чата -->
                        <div class="chat-mask">
                            <div class="chat-messages" id="chatMessages">
                                <!-- Начальные сообщения -->
                                <div class="message received">
                                    <div class="avatar">А</div>
                                    <div class="message-content">
                                        <div class="sender">Алексей</div>
                                        <div class="text">Привет всем!</div>
                                        <div class="time">10:30</div>
                                    </div>
                                </div>
                                <div class="message sent">
                                    <div class="avatar">Я</div>
                                    <div class="message-content">
                                        <div class="sender">Вы</div>
                                        <div class="text">Привет! Как дела?</div>
                                        <div class="time">10:32</div>
                                    </div>
                                </div>
                                <div class="message received">
                                    <div class="avatar">М</div>
                                    <div class="message-content">
                                        <div class="sender">Мария</div>
                                        <div class="text">Всем привет! Кто идет на пару?</div>
                                        <div class="time">10:33</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Блок индикаторов печатания -->
                        <div class="typing-block" id="typingBlock">
                            <div class="typing-indicator" id="alexTyping">
                                <div class="typing-avatar">А</div>
                                <div class="typing-content">
                                    <div class="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span class="typing-text">Алексей печатает</span>
                                </div>
                            </div>
                            <div class="typing-indicator" id="mariaTyping">
                                <div class="typing-avatar">М</div>
                                <div class="typing-content">
                                    <div class="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span class="typing-text">Мария печатает</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Поле ввода (не кликабельное) -->
                        <div class="chat-input-wrapper">
                            <div class="message-input-disabled">
                                <span>Сообщение...</span>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                return createTemplate('schedule');
        }
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Останавливаем предыдущую анимацию чата
            if (chatInterval) {
                clearInterval(chatInterval);
                chatInterval = null;
                isChatActive = false;
            }
            
            // Remove active class
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            
            // Update content
            const tabType = this.getAttribute('data-tab');
            content.innerHTML = createTemplate(tabType);
            
            // Start chat animation if chat tab
            if (tabType === 'chat') {
                isChatActive = true;
                initDynamicChatWithMask();
            }
        });
    });
}

// Динамический чат с маской
function initDynamicChatWithMask() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingBlock = document.getElementById('typingBlock');
    const alexTyping = document.getElementById('alexTyping');
    const mariaTyping = document.getElementById('mariaTyping');
    
    if (!messagesContainer || !typingBlock) return;
    
    // Скрываем все индикаторы печатания сначала
    alexTyping.style.display = 'none';
    mariaTyping.style.display = 'none';
    
    // Сообщения для чата
    const chatMessages = [
        { text: "Кто сделал домашку?", sender: "Алексей", avatar: "А", isMe: false },
        { text: "Я уже сдал", sender: "Вы", avatar: "Я", isMe: true },
        { text: "Мне нужна помощь", sender: "Мария", avatar: "М", isMe: false },
        { text: "Какая задача?", sender: "Вы", avatar: "Я", isMe: true },
        { text: "С третьим номером", sender: "Мария", avatar: "М", isMe: false },
        { text: "Сейчас помогу", sender: "Вы", avatar: "Я", isMe: true },
        { text: "Спасибо!", sender: "Алексей", avatar: "А", isMe: false },
        { text: "Можно к вам присоединиться?", sender: "Мария", avatar: "М", isMe: false },
        { text: "Конечно, создам чат", sender: "Вы", avatar: "Я", isMe: true },
        { text: "Отлично!", sender: "Алексей", avatar: "А", isMe: false },
        { text: "Когда встречаемся?", sender: "Мария", avatar: "М", isMe: false },
        { text: "Завтра после пар", sender: "Вы", avatar: "Я", isMe: true },
        { text: "Договорились!", sender: "Алексей", avatar: "А", isMe: false }
    ];
    
    let messageQueue = [...chatMessages];
    let isTyping = false;
    let currentTypingPerson = null;
    
    // Функция для обрезки невидимых сообщений
    function trimInvisibleMessages() {
        const chatMask = document.querySelector('.chat-mask');
        if (!chatMask) return;
        
        const maskHeight = chatMask.clientHeight;
        const messages = Array.from(messagesContainer.querySelectorAll('.message'));
        
        // Находим высоту всех сообщений
        let totalHeight = 0;
        let messagesToKeep = [];
        
        // Идем с конца (новые сообщения)
        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            const messageHeight = message.offsetHeight + 12; // + gap
            
            if (totalHeight + messageHeight <= maskHeight) {
                messagesToKeep.unshift(message);
                totalHeight += messageHeight;
            } else {
                // Удаляем сообщение, которое не влезает в маску
                message.remove();
            }
        }
        
        // Если остались старые сообщения сверху, удаляем их
        const allMessages = messagesContainer.querySelectorAll('.message');
        const keepCount = messagesToKeep.length;
        
        if (allMessages.length > keepCount) {
            for (let i = 0; i < allMessages.length - keepCount; i++) {
                allMessages[i].remove();
            }
        }
    }
    
    // Функция добавления сообщения
    function addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isMe ? 'sent' : 'received'}`;
        messageDiv.innerHTML = `
            <div class="avatar">${message.avatar}</div>
            <div class="message-content">
                <div class="sender">${message.sender}</div>
                <div class="text">${message.text}</div>
                <div class="time">${getCurrentTime()}</div>
            </div>
        `;
        
        // Добавляем в конец
        messagesContainer.appendChild(messageDiv);
        
        // Сразу обрезаем невидимые сообщения
        trimInvisibleMessages();
        
        // Анимация появления
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = message.isMe ? 'translateX(10px)' : 'translateX(-10px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'opacity 0.3s, transform 0.3s';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 10);
    }
    
    // Функция симуляции печатания и отправки сообщения
    function simulateTypingAndSending() {
        if (isTyping || messageQueue.length === 0) return;
        
        isTyping = true;
        
        // Выбираем случайного отправителя (но не "Вы")
        const possibleSenders = ['Алексей', 'Мария'];
        const sender = possibleSenders[Math.floor(Math.random() * possibleSenders.length)];
        const avatar = sender === 'Алексей' ? 'А' : 'М';
        
        // Берем первое сообщение из очереди
        const messageData = messageQueue.shift();
        
        // Показываем индикатор печатания
        const typingIndicator = sender === 'Алексей' ? alexTyping : mariaTyping;
        currentTypingPerson = typingIndicator;
        typingIndicator.style.display = 'flex';
        
        // Время печатания (0.8-1.5 секунды)
        const typingTime = 800 + Math.random() * 700;
        
        setTimeout(() => {
            // Скрываем индикатор печатания
            typingIndicator.style.display = 'none';
            
            // Добавляем сообщение
            addMessage({
                text: messageData.text,
                sender: sender,
                avatar: avatar,
                isMe: false
            });
            
            // Возвращаем сообщение в конец очереди для бесконечного цикла
            messageQueue.push(messageData);
            
            isTyping = false;
            currentTypingPerson = null;
            
        }, typingTime);
    }
    
    // Симуляция моих сообщений (без индикатора "Вы печатаете")
    function simulateMyMessage() {
        if (messageQueue.length === 0) return;
        
        // Случайный шанс 20%, что отвечу я
        if (Math.random() < 0.2) {
            const myMessages = [
                "Понял",
                "Согласен",
                "Хорошо",
                "Давайте",
                "Угу",
                "Правильно",
                "Так и есть",
                "Я тоже"
            ];
            
            const randomMessage = myMessages[Math.floor(Math.random() * myMessages.length)];
            
            // Небольшая пауза перед моим ответом
            setTimeout(() => {
                addMessage({
                    text: randomMessage,
                    sender: "Вы",
                    avatar: "Я",
                    isMe: true
                });
            }, 300 + Math.random() * 500);
        }
    }
    
    // Запускаем чат
    function startChat() {
        // Первая симуляция через 1 секунду
        setTimeout(() => {
            simulateTypingAndSending();
            
            // Интервал для новых сообщений (каждые 2-3.5 секунды)
            const messageInterval = setInterval(() => {
                simulateTypingAndSending();
                
                // После отправки чужого сообщения, иногда отвечаю я
                setTimeout(simulateMyMessage, 500);
            }, 2000 + Math.random() * 1500);
            
            // Сохраняем интервал
            window.chatMessageInterval = messageInterval;
            
        }, 1000);
    }
    
    // Запускаем чат
    startChat();
    
    // Обрезаем сообщения при изменении размера окна
    window.addEventListener('resize', trimInvisibleMessages);
}

function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Social glass effect
function initSocialGlassEffect() {
    const socialContainer = document.querySelector('.social-container-uiverse');
    if (socialContainer) {
        const socialGlasses = socialContainer.querySelectorAll('.social-glass');
        
        socialContainer.addEventListener('mouseenter', () => {
            socialGlasses.forEach((glass, index) => {
                glass.style.transition = 'transform 0.5s ease, margin 0.5s ease';
                glass.style.transitionDelay = `${index * 0.1}s`;
            });
        });
        
        socialContainer.addEventListener('mouseleave', () => {
            socialGlasses.forEach((glass, index) => {
                glass.style.transition = 'transform 0.5s ease, margin 0.5s ease';
                glass.style.transitionDelay = `${index * 0.1}s`;
            });
        });
    }
}

// Smooth scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Очистка интервалов чата при уходе со страницы
window.addEventListener('beforeunload', function() {
    if (window.chatMessageInterval) {
        clearInterval(window.chatMessageInterval);
    }
});