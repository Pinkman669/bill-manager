// Load user info
async function loadUser() {
    const res = await fetch('/friends')
    const result = await res.json()
    const username = document.querySelector('#greet-user')
    const userPic = document.querySelector('.member-pic-div')
    const oweTable = document.querySelector('#user-owe-detail')
    const creditTable = document.querySelector('#user-credit-detail')
    const balanceTag = document.querySelector('#user-balance')
    balanceTag.textContent = result.totalBalance
    // const balance = document.querySelector('#user-balance')
    username.textContent = result.user[0].nickname
    userPic.innerHTML += `<img src="${result.user[0].image ? `uploads/${result.user[0].image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`

    console.log(result.friendsRecords)
    for (let i in result.friendsRecords) {
        if (result.friendsRecords[i].friendsAmount < 0) {
            oweTable.innerHTML += `<tr>
                                        <th scope="row">
                                            <a href="#" userID="${result.friendsRecords[i].friendsID}">${result.friendsRecords[i].friendsName}</a>
                                            <img class="users-pic" src="${result.friendsRecords[i].image ? `uploads/${result.friendsRecords[i].image}` : `image/default_profile.jpg`}">
                                        </th>
                                        <td>${result.friendsRecords[i].friendsAmount}</td>
                                    </tr>`
        } else {
            creditTable.innerHTML += `<tr>
                                        <th scope="row">
                                            <a href="#" userID="${result.friendsRecords[i].friendsID}">${result.friendsRecords[i].friendsName}</a>
                                            <img class="users-pic" src="${result.friendsRecords[i].image ? `uploads/${result.friendsRecords[i].image}` : `image/default_profile.jpg`}">
                                        </th>
                                        <td>${result.friendsRecords[i].friendsAmount}</td>
                                    </tr>`
        }
    }

}


// Window onload function
window.addEventListener('load', async () => {
    await loadUser();
})