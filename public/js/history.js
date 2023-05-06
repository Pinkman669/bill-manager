// Declare variable
const events = document.querySelector('.history-div');
const userPic = document.querySelector('.member-pic-div');

// Load user pic
async function loadPic() {
    const res = await fetch('/home')
    const result = await res.json()
    userPic.innerHTML += `<img src="${result.userInfo.image ? `uploads/${result.userInfo.image}` : `image/default_profile.jpg`}" 
    alt="profile-image" class="profile-pic" />`
}

// Load user's history info in most recent 3 months
async function loadHistory(res) {
	const result = await res.json();
	for (let i in result.history) {
		const event = result.history[i];
		const nickname = uppercaseName(event.nickname);
		const date = new Date(result.history[i].date).toDateString();

		events.innerHTML += `<div class="history-detail-div invisible">
                                <div class="history-events-div">
                                    <div class="events-date"><span>Date: </span><span>${date}</span></div>
                                    <div class="events-location"><span>Event Name: </span><a href="/event-detail.html?recordId=${i.record_id}" event-id="${event.event_id}">${event.name}</a></div>
                                </div>
                                <div class="events-amount-div">
                                    <div class="events-info" event_id="${event.event_id}"> 
                                    ${event.accepted ? // if user accepted
                                        `<p class="trans-info">[Transaction: ${event.due ? `Completed` : `Not yet complete`}]</p>
                                                                                        ${event.type === `request` ?
                                            `<p>${event.due ?
                                                ` You paid <a href="/friendsdetail.html?friendID=${
                                                    event.user_id
                                                }" user-id="${event.user_id}">${nickname}</a> $${event.amount}` :
                                                ` Waiting to pay <a href="/friendsdetail.html?friendID=${
                                                    event.user_id
                                                }" user-id="${event.user_id}">${nickname}</a> $${event.amount}`
                                            }</p>` :
                                            `<p>${event.due ?
                                                ` <a href="/friendsdetail.html?friendID=${
                                                    event.user_id
                                                }" user-id="${event.user_id}">${nickname}</a> paid you $${event.amount}` :
                                                `Waiting <a href="/friendsdetail.html?friendID=${
                                                    event.user_id
                                                }" user-id="${event.user_id}">${nickname}</a> to pay you $${event.amount}`
                                            }</p>`
                                        }`
                                    // if user rejected
                                    : `${event.accepted === false ?
                                        `<p class="trans-info">[Transaction: Cancelled]</p><p>${event.type === `request` ? ` You rejected <a href="/friendsdetail.html?friendID=${
                                            event.user_id
                                        }" user-id="${event.user_id}">${nickname}</a> request` :
                                            `<a href="/event-detail.html?recordId=${i.record_id}" user-id="${event.user_id}">${nickname}</a> rejected your request`}</p>`
                                        // if accepted = null = pending
                                        : `<p class="trans-info">[Pending]</p> 
                                            <p>${event.type === `request` ?
                                            `<a href="/friendsdetail.html?friendID=${
                                                event.user_id
                                            }" user-id="${event.user_id}">${nickname}</a> requested you to pay $${event.amount}
                                                                                            <div class="pending-request" event_id="${event.event_id}">
                                                                                                <button type="button" id="accept" class="pending-btn">
                                                                                                <i class="bi bi-check" alt="accept-request"></i></button>
                                                                                                <button type="button" id="reject" class="pending-btn">
                                                                                                <i class="bi bi-x" alt="reject-request"></i></button>
                                                                                            </div>` :
                                            `You requested <a href="/friendsdetail.html?friendID=${
                                                    event.user_id
                                                }" user-id="${event.user_id}">${nickname}</a> to pay $${event.amount}`
                                            }</p>`
                                        }`
                                    }</div>
                                </div>
                                </div>
                                <hr class="line invisible">`;
	}
	// Animation delay effect
	const detailDivs = [...document.querySelectorAll('.history-detail-div')];
	const hrLines = [...document.querySelectorAll('.line')];
	for (let j in detailDivs) {
		setTimeout(() => {
			animateCSS(detailDivs[j], 'animate__fadeIn');
			detailDivs[j].classList.remove('invisible');
			hrLines[j].classList.remove('invisible');
		}, 0 + Number(j) * 50);
	}
	// change accept value
	const changeAcceptDivs = [...document.querySelectorAll('.pending-request')];
	for (let i in changeAcceptDivs) {
		const form = changeAcceptDivs[i];
		const eventID = form.getAttribute('event_id');
		const pendingBtns = [...form.querySelectorAll('.pending-btn')];
		for (let j in pendingBtns) {
			pendingBtns[j].addEventListener('click', async (e) => {
				const acceptance =
					e.currentTarget.id === 'accept' ? true : false;
				const res = await fetch(`/home/accept`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ eventID, acceptance })
				});
				const result = await res.json();
				console.log(result);
				if (result.success) {
					form.innerHTML = '';
					const newP = document.createElement('div');
					newP.appendChild(
						document.createTextNode(
							`<Requested ${
								acceptance ? `accepted` : `rejected`
							}>`
						)
					);
					form.appendChild(newP);
				}
			});
		}
	}
}

// UpperCase all username
function uppercaseName(name) {
	return name.slice(0, 1).toUpperCase() + name.slice(1, name.length);
}

// filter function
function changeFilter() {
    document.querySelector('.form-select').addEventListener('change', async (e) => {
        events.innerHTML = ''
        if (e.target.value === 'recent') {
            const res = await fetch('/history/recent')
            return await loadHistory(res)
        } else if (e.target.value === 'lentHistory') {
            const res = await fetch('/history/lentHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'borrowedHistory') {
            const res = await fetch('/history/borrowedHistory')
            return await loadHistory(res)
        } else if (e.target.value === 'allHistory') {
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
const changeAcceptBtns = [...document.querySelectorAll('.pending-request')];
for (let i in changeAcceptBtns) {
	const changeAcceptBtn = changeAcceptBtns[i];
	changeAcceptBtn.querySelector('#accept').value = 'null';
}

// Windows onload
window.addEventListener('load', async () => {
    await loadPic()
    const searchParams = new URLSearchParams(location.search);
	const historyType = searchParams.get('type');
    document.querySelector('.form-select').value = historyType || 'recent'
    const res = await fetch(`/history/${document.querySelector('.form-select').value}`)
    await loadHistory(res)
    changeFilter()
})

// Animated function
function animateCSS(node, animation) {
	node.classList.add('animate__animated');
	node.classList.add(animation);

	function handleAnimationEnd(e) {
		e.stopPropagation();
		node.classList.remove(`animate__animated`);
		node.classList.remove(animation);
	}
	node.addEventListener('animationend', handleAnimationEnd);
}
