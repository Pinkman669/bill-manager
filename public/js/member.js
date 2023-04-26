// Load user info
async function loadUser() {
    const res = await fetch('/member')
    const result = await res.json()
    const username = document.querySelector('#greet-user')
    const userPic = document.querySelector('.member-pic-div')
    const oweTable = document.querySelector('#user-owe-detail')
    const creditTable = document.querySelector('#user-credit-detail')
    // const balance = document.querySelector('#user-balance')
    username.textContent = result.user[0].nickname
    userPic.innerHTML += `<img src="${result.user[0].image ? `uploads/${result.user[0].image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`

    for (let i in result.requestor) {
        oweTable.innerHTML += `<tr>
                                    <th scope="row">${result.requestor[i].nickname}</th>
                                    <td>${result.requestor[i].amount}</td>
                                </tr>`
    }

    // for (let i in result.receiver) {
    //     creditTable.innerHTML += `<tr>
    //                                 <th scope="row">${result.receiver[i].nickname}</th>
    //                                 <td>${result.receiver[i].amount}</td>
    //                             </tr>`
    // }
}


// Window onload function
window.addEventListener('load', async () => {
    loadUser()
})