const searchParams = new URLSearchParams(location.search);
const id = searchParams.get('friendID');

async function loadFriendsDetail() {
	const res = await fetch(`/friendsdetail/${id}`);
	const result = await res.json();
	const friendName = document.querySelector('#friends_nickname');
	const balance = document.querySelector('#balance_btw_friends');
	const individual = document.querySelector('#individual_table');
	const group = document.querySelector('#group_table');
	const friendIcon = document.querySelector(`.member-profile`);
	const fdNickname = result.friend[0].nickname;
	const icon = result.friend[0].image;

	friendName.textContent = fdNickname;
	balance.textContent = result.totalAmount; // the btw-friends balance;
	friendIcon.innerHTML = `<img class="profile-pic " src="${
		result.friend[0].image ? `uploads/${icon}` : `image/default_profile.jpg`
	}">`;

	// individual history
	individual.innerHTML = ''; //clear

	for (let i of result.history) {
		const date = new Date(i.date).toDateString();
		individual.innerHTML += `<div class="event-detail ${
			i.due ? `settle` : `not-settle`
		}">
									<div class="event-info-detail">
										<div class="date">Date:${date}</div>
										<a href="/event-detail.html?recordId=${i.record_id}" user-id="${
			i.event_id
		}"class="event-name">Event Name:${i.name}</a>
									</div>
									<div class="event-payment-detail">
										<div id="settled">${i.due ? `Settle` : `Not Settle`}</div>
										<div>${
											i.requestor_id === Number(id)
												? `You borrowed ${i.amount} from ${fdNickname}`
												: `You lent ${i.amount} to ${fdNickname}`
										}</div>
									</div>
								</div>`;
	}
}

const settleBtn = document.querySelector(`#settle-btn`);

settleBtn.addEventListener('click', async (event) => {
	const res = await fetch('/friendsdetail/settle', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ friendId: id })
	});
	loadFriendsDetail();
});

// Window onload function
window.addEventListener('load', async () => {
	loadFriendsDetail();
});
