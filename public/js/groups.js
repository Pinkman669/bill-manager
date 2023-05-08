import { animateCSS, loadPic } from "./exportFn.js";
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
            } else{
                resMsg.classList.remove('hidden')
                resMsg.textContent = result.msg
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
    const groupsBox = document.querySelector('.group-div')
    
    if (result.success){
        groupsBox.innerHTML = ''
        result.userGroup.forEach(async (data, i)=>{
            const res = await fetch(`/groups/group-detail?groupID=${data.id}`)
            const groupResult = await res.json()
            groupsBox.innerHTML += `<div class="group-summary-div invisible ${groupResult.groupBalance >= 0 ? 'settle': 'not-settle'}">
                                        <div class="group-name">
                                            <div>Group: </div>
                                            <a href="group-detail.html?groupID=${data.id}">${data.name}</a>
                                        </div>
                                        <div class="group-balance">
                                            <div class="group-amount-type">
                                                ${groupResult.groupBalance >= 0 ? 'Your Lent: ' : 'You Borrowed: '}
                                            </div>
                                            <div class="group-amount">
                                                ${groupResult.groupBalance}
                                            </div>
                                        </div>
                    </div>`
                    const groupSummaryDiv = [...document.querySelectorAll('.group-summary-div')]
                    groupSummaryDiv.forEach((groupDiv, j)=>{
                        setTimeout(()=>{
                            animateCSS(groupDiv, 'animate__bounceInLeft')
                            groupDiv.classList.remove('invisible')
                        }, 0 + Number(j) * 50)
                    })
        })
    }
}

// window onload
window.addEventListener('load', async ()=>{
    await loadFriends();
    await loadGroup();
    await loadPic()
})
