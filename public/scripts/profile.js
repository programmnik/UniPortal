document.addEventListener('DOMContentLoaded', ()=>{
    const logoutBtn = document.getElementById('logoutBtn');

    if(logoutBtn){
        logoutBtn.addEventListener('click', (event) =>{
            event.preventDefault();

            destroySession();

            window.location.href = '/';
        });
    }

    
});