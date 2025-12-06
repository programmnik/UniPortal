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
        profileNameLetter.forEach(element => {
            element.textContent = user.nickname ? user.nickname.charAt(0).toUpperCase() : "?";
        });
        
        const userRoleElement = document.getElementById('profileRole');
    }

    
});