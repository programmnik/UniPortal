document.addEventListener('DOMContentLoaded', ()=>{
    const user = getCurrentUser();
    if(user){
        const profileNameElements = document.querySelectorAll('.user-profile-name');
        if(profileNameElements){
            profileNameElements.forEach(element => {
                element.textContent = user.nickname;
            });
        }

        const nicknameInput = document.getElementById('profileNickname');
        if(nicknameInput){
            nicknameInput.value = user.nickname;
        }

        const profileNameLetter = document.querySelectorAll('.user-profile-name-fletter');
        if(profileNameLetter){
            profileNameLetter.forEach(letter => {
                letter.textContent = user.nickname ? user.nickname.charAt(0).toUpperCase() : "?";
            });
        }    

        const userEmail = document.querySelectorAll('.profile-email');
        if(userEmail){
            userEmail.forEach(em => {
                let shortEmail = user.email
                if(shortEmail.length > 15){
                    const atIndex = shortEmail.indexOf('@');

                    if(atIndex !== -1){
                        let localPart = shortEmail.substring(0, atIndex);
                        let domainPart = shortEmail.substring(atIndex + 1);

                        if(localPart.length > 5){
                            localPart = localPart.substring(0,5) + "*";
                        }

                        if(domainPart.length > 9){
                            const dotIndex = domainPart.lastIndexOf('.');
                            if(domainPart !== -1){
                                const domainName = domainPart.substring(0, dotIndex);
                                const domainExt = domainPart.substring(dotIndex);

                                if(domainName.length > (9-domainExt.length - 1)){
                                    const keepChars = Math.max(1, 9 - domainExt.length - 2);
                                    domainPart = ((7 - domainExt.length) <= 0) 
                                        ? domainName.substring(0, keepChars) + '*' + domainExt 
                                        : domainName.substring(0, 1) + '*' + domainExt.substring(0, 6) + '*';
                                }
                            }else{
                                domainPart = domainPart.substring(0, 9) + '*';
                            }
                        }

                        shortEmail = localPart + '@' + domainPart;
                    }

                }
                em.textContent = shortEmail;
            });
        }

        const emailInput = document.getElementById('profileEmail');
        if (emailInput && user.email) {
            emailInput.value = user.email;
        }
        
        const userRoleID = document.getElementById('profileRole');
        if (userRoleID) {
            userRoleID.value = user.role;
        }

        const userRoleElement = document.querySelectorAll('.profileRole');
        if(userRoleElement){
            userRoleElement.forEach(roleElement => {
                roleElement.textContent = user.role;
            });
        }

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