document.addEventListener('DOMContentLoaded', ()=>{
    const user = getCurrentUser();
    if(user){
        const profileNameElements = document.querySelectorAll('.user-profile-name');
        profileNameElements.forEach(element => {
            element.textContent = user.nickname;
        });

        const nicknameInput = document.getElementById('profileNickname');
        nicknameInput.value = user.nickname;

        const profileNameLetter = document.querySelectorAll('.user-profile-name-fletter');
        profileNameLetter.forEach(letter => {
            letter.textContent = user.nickname ? user.nickname.charAt(0).toUpperCase() : "?";
        });

        const userEmail = document.querySelectorAll('.profile-email');
        userEmail.forEach(email => {
            email.textContent = user.email;
        });
        
        const userRoleID = document.getElementById('profileRole');
        if (userRoleID) {
            userRoleID.value = user.role;
        }

        const userRoleElement = document.querySelectorAll('.profileRole');
        userRoleElement.forEach(roleElement => {
            roleElement.textContent = user.role;
        });

        // 3. Управление видимостью элементов по ролям (Навигация)
        // В соответствии с ТЗ, Администратору доступна админка.
        const adminLink = document.getElementById('navAdminLink');
        if (adminLink && user.role !== 'Администратор') {
            // Скрываем ссылку на админку, если пользователь не Администратор
            adminLink.style.display = 'none';
        }

        const journalModFeature = document.getElementById('journalModeration');
        if (journalModFeature && (user.role === 'Студент')) {
            // Скрываем элементы модерации, если пользователь — простой студент
            journalModFeature.style.display = 'none';
        }
    }
});