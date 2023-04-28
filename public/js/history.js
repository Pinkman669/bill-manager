// Declare variable
const events = document.querySelector('.history-div')
const userPic = document.querySelector('.member-pic-div')

// Load user pic
async function loadPic(){
    const res = await fetch('/home')
    const result = await res.json()
    console.log(result)
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
                                    <p class="events-info">${event.type === `request` ?
                                                             `You paid <a href="#" user-id="${event.user_id}">${nickname}</a> $${event.amount}` :
                                                             `<a href="#" user-id="${event.user_id}">${nickname}</a> paid you $${event.amount}`
                                                            }</p>
                                </div>
                            </div>
                            <hr>`
    }
}

// UpperCase all username
function uppercaseName(name){
    return name.slice(0, 1).toUpperCase() + name.slice(1, name.length)
}

// filter function
function changeFilter(){
    document.querySelector('.form-select').addEventListener('change', async (e)=>{
        // userPic.innerHTML = ''
        events.innerHTML = ''
        if (e.target.value === 'recent-history'){
            const res = await fetch('/history')
            return await loadHistory(res)
        } else if (e.target.value === 'lent-history'){
            const res = await fetch('/history/lentHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'borrowed-history'){
            const res = await fetch('/history/borrowedHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'all-history'){
            const res = await fetch('history/allHistory')
            return await loadHistory(res)
        }
    })
}

// Windows onload
window.addEventListener('load', async () => {
    await loadPic()
    const res = await fetch('/history')
    await loadHistory(res)
    changeFilter()
})