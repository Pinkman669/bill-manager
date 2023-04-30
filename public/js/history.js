// Declare variable
const events = document.querySelector('.history-div')
const userPic = document.querySelector('.member-pic-div')

// Load user pic
async function loadPic() {
    const res = await fetch('/home')
    const result = await res.json()
    userPic.innerHTML += `<img src="${result.user[0].image ? `uploads/${result.user[0].image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`
}

// Load user's history info in most recent 3 months
async function loadHistory(res) {
    const result = await res.json()

    for (let i in result.history) {
        const event = result.history[i]
        const nickname = uppercaseName(event.nickname)
        const date = new Date(result.history[i].date).toDateString()

        events.innerHTML += `<div class="history-detail-div">
                                <div class="history-events-div">
                                    <p class="events-date">Date: ${date}</p>
                                    <p class="events-location">Event Name: <a href="#" event-id="${event.event_id}">${event.name}</a></p>
                                </div>
                                <div class="events-amount-div">
                                    <div class="events-info" event_id="${event.event_id}"> ${event.accepted ? // if user accepted
                `[Transaction: ${event.due ? `Completed` : `Not yet complete`}]
                                                                ${event.type === `request` ?
                    `${event.due ?
                        ` You paid <a href="#" user-id="${event.user_id}">${nickname}</a> $${event.amount}` :
                        ` Waiting to pay <a href="#" user-id="${event.user_id}">${nickname}</a> $${event.amount}`
                    }` :
                    `${event.due ?
                        ` <a href="#" user-id="${event.user_id}">${nickname}</a> paid you $${event.amount}` :
                        `Waiting <a href="#" user-id="${event.user_id}">${nickname}</a> to pay you $${event.amount}`
                    }`
                }`
                // if user rejected
                : `${event.accepted === false ?
                    `[Transaction: Cancelled] ${event.type === `request` ? ` You rejected <a href="#" user-id="${event.user_id}">${nickname}</a> request` :
                        ` <a href="#" user-id="${event.user_id}">${nickname}</a> rejected your request`}`
                    // if accepted = null = pending
                    : `[Pending] 
                                                                    ${event.type === `request` ?
                        `<a href="#" user-id="${event.user_id}">${nickname}</a> requested you to pay $${event.amount}
                                                                        <form method="POST" class="pending-request" event_id="${event.event_id}">
                                                                            <button type="submit" id="accept" class="accept-btn">
                                                                            <i class="bi bi-check"></i></button>
                                                                            <button type="submit" id="reject" class="accept-btn">
                                                                            <i class="bi bi-x"></i></button>
                                                                        </form>` :
                        `You requested <a href="#" user-id="${event.user_id}">${nickname}</a> to pay $${event.amount}`
                    }`
                }`
            }</div>
                                </div>
                            </div>
                            <hr>`
    }

    // change accept value 
    const changeAcceptForms = [...document.querySelectorAll('.pending-request')]
    for (let i in changeAcceptForms) {
        const form = changeAcceptForms[i]
        const eventID = form.getAttribute('event_id')
        form.querySelector('#accept').addEventListener('click', async (e)=>{
            e.preventDefault()

            const res = await fetch(`/home/accept`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({eventID})
            })
            const result = await res.json()
            if (result.success){
                console.log('Accepted!')
            }
        })
        form.querySelector('#reject').addEventListener('click', async (e)=>{
            e.preventDefault()

            const res = await fetch(`/home/reject`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({eventID})
            })
            const result = await res.json()
            if (result.success){
                console.log('Rejected!')
            }
        })
    }
}

// UpperCase all username
function uppercaseName(name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1, name.length)
}

// filter function
function changeFilter() {
    document.querySelector('.form-select').addEventListener('change', async (e) => {
        events.innerHTML = ''
        if (e.target.value === 'recent-history') {
            const res = await fetch('/history')
            return await loadHistory(res)
        } else if (e.target.value === 'lent-history') {
            const res = await fetch('/history/lentHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'borrowed-history') {
            const res = await fetch('/history/borrowedHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'all-history') {
            const res = await fetch('history/allHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'pending') {
            const res = await fetch('history/pending')
            return await loadHistory(res)
        } else if (e.target.value === 'cancelled-history') {
            const res = await fetch('history/cancelled-history')
            return await loadHistory(res)
        }
    })
}

// change acceptance value
const changeAcceptBtns = [...document.querySelectorAll('.pending-request')]
for (let i in changeAcceptBtns) {
    const changeAcceptBtn = changeAcceptBtns[i]
    changeAcceptBtn.querySelector('#accept').value = "null"
}

// Windows onload
window.addEventListener('load', async () => {
    await loadPic()
    const res = await fetch('/history')
    await loadHistory(res)
    changeFilter()
})