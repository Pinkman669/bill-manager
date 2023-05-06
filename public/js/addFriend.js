export async function addFriend(){
    const modalDiv = document.querySelector('#add-friends-modal-div')

        const res = await fetch('/activity')
        const result = await res.json()
        
        if (result.success){
            modalDiv.innerHTML = ''
            for (let i in result.friendList){
                const friend = result.friendList[i];
                modalDiv.innerHTML += `<div class="friend-name-div">
                                            <label for="${friend.user_id}">
                                                <input type="checkbox" class="friend-input" value="${friend.user_id}" id="${friend.user_id}" friend-name="${friend.nickname}">
                                                <span class="friend-name">${friend.nickname}</span>
                                            </label>
                                        </div>`
            }
        }

        // Display friend name
        const selectedUsersDiv = document.querySelector('#selected-friends-div')
        const friendBoxes = [...document.querySelectorAll('.friend-input')]
        friendBoxes.forEach((friendBox)=>{
            friendBox.addEventListener('change', (e)=>{
                if (friendBox.checked){
                    const friendName = friendBox.getAttribute('friend-name')
                    const newP = document.createElement('p')
                    newP.classList.add('selected-name')
                    newP.setAttribute('friend-name', friendName)
                    const newContent = document.createTextNode(friendName)
                    newP.appendChild(newContent)
                    selectedUsersDiv.appendChild(newP)
                }
                if (!friendBox.checked){
                    const selectedUsers = [...document.querySelectorAll('.selected-name')]
                    selectedUsers.forEach((user)=>{
                        if (user.getAttribute('friend-name') === friendBox.getAttribute('friend-name')){
                            selectedUsersDiv.removeChild(user)
                        }
                    })
                }
            })
        })
    
}