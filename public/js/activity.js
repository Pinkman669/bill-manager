// Declare variable
// const totalAmount = document.getElementById('amount')
// const numOfPeople = document.getElementById('people')
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
                                    <input class="usersCheckBox" type="checkbox" value="${result.userInfo.userID}" name="${result.userInfo.userName}" checked form="activity-form" ${requestorBtn.value == result.userInfo.userID ? `disabled` : ``}>
                                    <label for="${result.userInfo.userID}">You ${method === 'evenly'|| method === 'custom' ? `$` : `shares`}</label>
                                    <input class="usersAmountInput" type="number" name="${result.userInfo.userName}-amount" form="activity-form" required ${requestorBtn.value == result.userInfo.userID ? `disabled` : ``}>
                                </div>`
    selectedFriends.forEach((friend)=>{
        const friendName = friend.getAttribute('userName')
        const friendID = friend.getAttribute('userID')
        userAmountBox.innerHTML += `<div class="selected-user-div">
                                        <input class="usersCheckBox" type="checkbox" value="${friendID}" name="${friendName}" checked form="activity-form" ${requestorBtn.value == friendID ? `disabled`: ``}>
                                        <label for="${friendID}">${friendName}: ${method === 'evenly'|| method === 'custom' ? `$` : `shares`}</label>
                                        <input class="usersAmountInput" type="number" name="${friendName}-amount" form="activity-form" required ${requestorBtn.value == friendID ? `disabled`: ``}>
				                    </div>`
    })
}

// Split-method function
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
        for (let option of requestorBtn){
            if (option.selected && option.disabled){
                return
            }
        }
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
            resMsg.textContent = 'Please fill out the form'
            return
        }
        const form = document.querySelector('#activity-form')
        const formObj = {
            actName: form['event-name'].value,
            actDate: form['event-date'].value,
            totalAmount: form['total-amount'].value,
            receiversInfo: {
                userID: [],
                userAmount: [],
            },
            requestorInfo: {}
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
        console.log(formObj)
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