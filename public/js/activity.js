// Declare variable
const dividedBy = document.getElementById('denominator')
const requestorBtn = document.querySelector('#requestor')
const resMsg = document.querySelector('.resMsg')

// Render paid by select option
async function LoadSelector(){
    const res = await fetch('/home')
    const result = await res.json()
    const selectedFriends = [...document.querySelectorAll('.selected-friend')]

    const newOpt = document.createElement('option')
    newOpt.value = result.userInfo.userID
    newOpt.textContent = 'You'
    requestorBtn.appendChild(newOpt)
    selectedFriends.forEach((friend)=>{
        const newOpt = document.createElement('option')
        newOpt.value = friend.getAttribute('userID')
        newOpt.textContent = friend.getAttribute('userName')
        requestorBtn.appendChild(newOpt)
    })
}

// Render users in payment input section
async function LoadFriendsInput(method){
    const res = await fetch('/home')
    const result = await res.json()
    const userAmountBox = document.querySelector('.container-fluid.users-amount')
    userAmountBox.innerHTML = ''
    const selectedFriends = [...document.querySelectorAll('.selected-friend')]
    userAmountBox.innerHTML += `<div class="selected-user-div">
                                    <input class="usersCheckBox" type="checkbox" value="${result.userInfo.userID}" name="${result.userInfo.userName}" form="activity-form" ${requestorBtn.value == result.userInfo.userID ? `disabled` : `checked`}>
                                    <label for="${result.userInfo.userID}">You ${method === 'evenly'|| method === 'custom' ? `$` : `shares`}</label>
                                    <input class="usersAmountInput" type="number" name="${result.userInfo.userName}-amount" form="activity-form" required ${requestorBtn.value == result.userInfo.userID ? `disabled` : ``}>
                                </div>`
    selectedFriends.forEach((friend)=>{
        const friendName = friend.getAttribute('userName')
        const friendID = friend.getAttribute('userID')
        userAmountBox.innerHTML += `<div class="selected-user-div">
                                        <input class="usersCheckBox" type="checkbox" value="${friendID}" name="${friendName}" form="activity-form" ${requestorBtn.value == friendID ? `disabled`: `checked`}>
                                        <label for="${friendID}">${friendName}: ${method === 'evenly'|| method === 'custom' ? `$` : `shares`}</label>
                                        <input class="usersAmountInput" type="number" name="${friendName}-amount" form="activity-form" required ${requestorBtn.value == friendID ? `disabled`: ``}>
				                    </div>`
    })
}

// Rendering payment input depends on split-method
function splitMethod(){
    const splitMethodBtns = [...document.querySelectorAll('.split-method')]
    splitMethodBtns.forEach((method)=>{
        method.addEventListener('change', async (e)=>{
            if (e.target.value === 'evenly'){
                return await LoadFriendsInput('evenly')
            } else if (e.target.value === 'shares'){
                return await LoadFriendsInput('shares')
            } else if (e.target.value === 'custom'){
                return await LoadFriendsInput('custom')
            }
        })
    })
}

// Submit form
function submitActivity(){
    document.querySelector('#form-submit-btn').addEventListener('click', async (e)=>{
        e.preventDefault()
        // Reject paid by not selected
        // for (let option of requestorBtn){
        //     if (option.selected && option.disabled){
        //         return
        //     }
        // }

        // Reject split method not selected
        const splitMethodBtns = [...document.querySelectorAll('.split-method')]
        let methodChecked = false
        for (let method of splitMethodBtns){
            if (method.checked){
                if (method.value === 'shares'){
                    if (document.querySelector('#denominator').value > 0){
                        methodChecked = true
                    }
                } else{
                    methodChecked = true
                }
            }
        }
        const inputFields = [...document.querySelectorAll('input')]
        inputFields.forEach((input)=>{
            if (!input.checkValidity()){
                methodChecked = false
            }
        })
        if (!methodChecked){
            resMsg.classList.replace('alert-success', 'alert-warning')
            resMsg.classList.remove('invisible')
            resMsg.textContent = 'Please fill out the form'
            return
        }
        const form = document.querySelector('#activity-form')
        const formObj = {
            actName: form['event-name'].value,
            actDate: form['event-date'].value,
            totalAmount: form['total-amount'].value,
            message: form.message.value,
            receiversInfo: {
                userID: [],
                userAmount: [],
            },
            requestorID: requestorBtn.value
        }
        const splitMethod = [...document.querySelectorAll('.split-method')]
        splitMethod.forEach((method)=>{
            if (method.checked){
                if (method.value === 'shares'){
                    formObj.method = {shares: document.querySelector('#denominator').value}
                } else{
                    formObj.method = method.value
                }
            }
        })
        const receiversID = [...document.querySelectorAll('.usersCheckBox')]
        const receiversAmount = [...document.querySelectorAll('.usersAmountInput')]
        receiversID.forEach((receiver, i)=>{
            if (receiver.checked){
                formObj.receiversInfo.userID.push(receiver.value)
                formObj.receiversInfo.userAmount.push(receiversAmount[i].value)
            }
        })

        form.reset()
        const res = await fetch('activity/create-activity',{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObj)
        })
        const result = await res.json();
        if (result.success){
            resMsg.classList.replace('alert-warning', 'alert-success')
        }
        resMsg.classList.remove('invisible')
        resMsg.textContent = result.msg
    })
}

// input option on change select
requestorBtn.addEventListener('change', (e)=>{
    const usersCheckBox = [...document.querySelectorAll('.usersCheckBox')]
    const usersAmountInput = [...document.querySelectorAll('.usersAmountInput')]
    usersCheckBox.forEach((user, i)=>{
        if (user.value === requestorBtn.value){
            user.checked = false
            user.disabled = true
            usersAmountInput[i].disabled = true
        } else{
            user.checked = true
            user.disabled = false
            usersAmountInput[i].disabled = false
        }
    })
})

LoadSelector()
submitActivity()
splitMethod()




// const billSplitter = () => {
//     let amount = parseInt(totalAmount);
//     let people = parseInt(numOfPeople);
//     let result = document.getElementById('averageAmount');

//     if (true) {
//         let denominator = parseInt(dividedBy);
//         const averagePayment = (totalAmount /denominator);
//         console.log(averagePayment);
//         result.innerHTML = averagePayment;
        
//     }
// }

//const splitStarter = document.querySelector('equally')
//splitStarter.addEventListener('click', (event) => {
    //result.innerHTML = event.target.value;
//})