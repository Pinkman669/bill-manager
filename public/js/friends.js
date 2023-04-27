
async function loadUser() {
    const res = await fetch('/friends')
    const result = await res.json()
    const username = document.querySelector('#username')
    const balanceTag = document.querySelector('#user-balance')
    const friendTable = document.querySelector('#friends-table')
   
    let balance = 0;
    // const balance = document.querySelector('#user-balance')
    username.textContent = result.user.nickname

    for (let i in result.requestor) {
        friendTable.innerHTML += `
                                <tr>
                                <th scope="row">
                                    <a href="#" userID="${result.requestor[i].id}">${result.requestor[i].nickname}</a>
                                    <img class="users-pic" src="${result.requestor[i].image ? `uploads/${result.requestor[i].image}` : `image/default_profile.jpg`}">
                                </th>   
                                    <td>-${result.requestor[i].amount}</td>
                                </tr>
                                `
    }


    balanceTag.textContent = balance
}



// Window onload function
window.addEventListener('load', async () => {
    loadUser()
})