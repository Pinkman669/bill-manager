// Declare variable
const events = document.querySelector('.history-div')
const userPic = document.querySelector('.member-pic-div')

// Load user's history info in most recent 3 months
async function loadHistory(res) {
    const result = await res.json()
    userPic.innerHTML += `<img src="${result.image ? `uploads/${result.image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`
    
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
        userPic.innerHTML = ''
        events.innerHTML = ''
        if (e.target.value === 'recent-history'){
            const res = await fetch('home/history')
            return await loadHistory(res)
        } else if (e.target.value === 'lent-history'){
            const res = await fetch('/home/lentHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'borrowed-history'){
            const res = await fetch('/home/borrowedHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'all-history'){
            const res = await fetch('home/allHistory')
            return await loadHistory(res)
        }
    })
}


// Windows onload
window.addEventListener('load', async () => {
    const res = await fetch('home/history')
    await loadHistory(res)
    changeFilter()
})