async function loadFriendsDetail() {
    const res = await fetch('/friendsdetail')
    const result = await res.json()
    const username = document.querySelector('#username')
    const balance = document.querySelector('#balance_btw_friends')
    const individual = document.querySelector('#individual')
    const group = document.querySelector('#group_table')
   
    let totalBalance = result.totalBalance;
    // const balance = document.querySelector('#user-balance')
    username.textContent = result.user[0].nickname

    balanceTag.textContent = balance

            
}

// Window onload function
window.addEventListener('load', async () => {
    loadFriends()
})