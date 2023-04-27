// Load user info
async function loadUser() {
    const res = await fetch('/home')
    const result = await res.json()
    const username = document.querySelector('#greet-user')
    const userPic = document.querySelector('.member-pic-div')
    const oweTable = document.querySelector('#user-owe-detail')
    const creditTable = document.querySelector('#user-credit-detail')
    const balanceTag = document.querySelector('#user-balance')
    let balance = 0;
    // const balance = document.querySelector('#user-balance')
    username.textContent = result.user[0].nickname
    userPic.innerHTML += `<img src="${result.user[0].image ? `uploads/${result.user[0].image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`

    for (let i in result.requestor) {
        oweTable.innerHTML += `<tr>
                                    <th scope="row">
                                        <a href="#" userID="${result.requestor[i].id}">${result.requestor[i].nickname}</a>
                                        <img class="users-pic" src="${result.requestor[i].image ? `uploads/${result.requestor[i].image}` : `image/default_profile.jpg`}">
                                    </th>
                                    <td>-${result.requestor[i].amount}</td>
                                </tr>`
        balance -= result.requestor[i].amount
    }

    for (let i in result.receiver) {
        creditTable.innerHTML += `<tr>
                                    <th scope="row">
                                        <a href="#" userID="${result.receiver[i].id}">${result.receiver[i].nickname}</a>
                                        <img class="users-pic" src="${result.requestor[i].image ? `uploads/${result.requestor[i].image}` : `image/default_profile.jpg`}">
                                    </th>
                                    <td>+${result.receiver[i].amount}</td>
                                </tr>`
        balance += result.receiver[i].amount
    }

    balanceTag.textContent = balance
}



// Window onload function
window.addEventListener('load', async () => {
    loadUser()
})