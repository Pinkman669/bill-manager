// Load user info
async function loadUser(){
    const res = await fetch('/member')
    const userInfo = await res.json()
    const username = document.querySelector('#greet-user')
    const userPic = document.querySelector('.profile-pic')
    // const balance = document.querySelector('#user-balance')
    username.textContent = userInfo.user.nickname
    if (userInfo.image){
        userPic.setAttribute('src', userInfo.image)
    }
}


// Window onload function
window.addEventListener('load', async ()=>{
    loadUser()
})