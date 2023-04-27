// Load user's history info
async function loadHistory() {
    const res = await fetch('home/history')
    const result = await res.json()
    const userPic = document.querySelector('.member-pic-div')
    const events = document.querySelector('.history-div')
    userPic.innerHTML += `<img src="${result.image ? `uploads/${result.image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`

    result.history.sort(compareFn)

    for (let i in result.history) {
        const event = result.history[i]
        const nickname = uppercaseName(event.nickname)
        const date = new Date(result.history[i].date).toDateString()

        events.innerHTML += `<div class="history-detail-div">
                                <div class="history-events-div">
                                    <p class="events-date">Date: ${date}</p>
                                    <p class="events-location">Event Name: ${event.event}</p>
                                </div>
                                <div class="events-amount-div">
                                    <p class="events-info">${event.type === `request` ?
                                                             `You paid ${nickname} $${event.amount}` :
                                                             `${nickname} paid you $${event.amount}`
                                                            }</p>
                                </div>
                            </div>
                            <hr>`
    }
}


// Sorting Fn from recent date to farther date
function compareFn(a, b) {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)
    console.log(aDate - bDate)
    return bDate - aDate
}

// UpperCase all username
function uppercaseName(name){
    return name.slice(0, 1).toUpperCase() + name.slice(1, name.length)
}

// Windows onload
window.addEventListener('load', async () => {
    await loadHistory();
})