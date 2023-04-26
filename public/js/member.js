// Load user info
async function loadUser() {
    const res = await fetch('/member')
    const userInfo = await res.json()
    const username = document.querySelector('#greet-user')
    const userPic = document.querySelector('.member-pic-div')
    // const balance = document.querySelector('#user-balance')
    username.textContent = userInfo.nickname
    userPic.innerHTML += `<img src="${userInfo.image ? `uploads/${userInfo.image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`
}


// Window onload function
window.addEventListener('load', async () => {
    loadUser()
})