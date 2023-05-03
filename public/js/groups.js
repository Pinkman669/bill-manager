// Declare variable
const form = document.querySelector('#create-group-form')
const resMsg = document.querySelector('.resMsg')

// Load friend list in create group window
async function loadFriends(){
    const res = await fetch('/groups/create-group');
    const result = await res.json();

    if (result.success){
        for (let i in result.friendList){
            const friend = result.friendList[i];
            form.innerHTML += `<div class="friend-name-div">
                                        <label for="${friend.user_id}">
                                            <input type="checkbox" class="friend-input" value="${friend.user_id}" id="${friend.user_id}" friend-name="${friend.nickname}">
                                            <span class="friend-name">${friend.nickname}</span>
                                        </label>
								    </div>`
        }
    }
    // Display selected user
    // const friendsBox = [...document.querySelectorAll('.friend-input')]
    // const selectedUsersBox = document.querySelector('#selected-user')
    // friendsBox.forEach((friendBox) =>{
    //     friendBox.addEventListener('change', (e)=>{
    //         if (friendBox.checked){
    //             const friendName = friendBox.getAttribute('friend-name')
    //             const newP = document.createElement('p')
    //             newP.classList.add('selected-name')
    //             newP.setAttribute('friend-name', friendName)
    //             const newContent = document.createTextNode(friendName)
    //             newP.appendChild(newContent)
    //             selectedUsersBox.appendChild(newP)
    //         }
    //         if (!friendBox.checked){
    //             const selectedUsers = [...document.querySelectorAll('.selected-name')]
    //             selectedUsers.forEach((user)=>{
    //                 if (user.getAttribute('friend-name') === friendBox.getAttribute('friend-name')){
    //                     selectedUsersBox.removeChild(user)
    //                 }
    //             })
    //         }
    //     })
    // })
}

// Create new group
document.querySelector('#submit-group-btn').addEventListener('click', async (e)=>{
    e.preventDefault()
    await createGroup();
})
async function createGroup(){
    const formObject = {
        groupName: form['group-name'].value,
        friendsID: []
    }
    const selectedFriends = [...document.querySelectorAll('.friend-input')]
    selectedFriends.forEach((selectedFriend)=>{
        if (selectedFriend.checked){
            formObject.friendsID.push(selectedFriend.value)
        }
    })
    if (formObject.groupName.length){
        if (formObject.friendsID.length){
            const res = await fetch('/groups/create-group',{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObject)
            });
            const result = await res.json()
            if (result.success){
                form.reset()
                document.querySelector('.btn-close').click()
                await loadGroup() // refresh load group
            }
        } else{
            resMsg.classList.remove('hidden')
            resMsg.textContent = 'Please selected at least one user'
        }
    } else{
        resMsg.classList.remove('hidden')
        resMsg.textContent = 'Please enter group name'
    }
}

// Load user group
async function loadGroup(){
    const res = await fetch('/groups')
    const result = await res.json()
    console.log(result)
    const groupsBox = document.querySelector('.container-fluid.groups')
    groupsBox.innerHTML = ''
    
    result.forEach((data)=>{
        groupsBox.innerHTML += `<div groupID="${data.id}"><a href="#">${data.name}</a><div/>`
    })
}


// window onload
window.addEventListener('load', async ()=>{
    await loadFriends();
    await loadGroup();
})