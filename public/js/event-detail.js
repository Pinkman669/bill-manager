const searchParams = new URLSearchParams(location.search);
const id = searchParams.get("recordId"); 

async function loadEventDetail() {
	const res = await fetch(`/eventdetail/${id}`);
	const result = await res.json();
	const eventName = document.querySelector('#event-name');
	const eventDate = document.querySelector('#event-date');
	const ownAmount = document.querySelector('#own-amount')
    const splitMethod = document.querySelector('#split-method');
	const friendsInvolved = document.querySelector('#friends-involved');
	const billTotal = document.querySelector('#bill-total-amount');
	const message = document.querySelector('#message');

	
	eventName.textContent = result.eventInfo[0].name;
	eventDate.textContent = new Date(result.eventInfo[0].date).toDateString();
	ownAmount.textContent = result.eventInfo[0].record_amount;
	splitMethod.textContent = result.eventInfo[0].Method;
	friendsInvolved.textContent = `${result.req[0].nickname}+ +${result.res[0].nickname}`;
	billTotal.textContent = result.eventInfo[0].total_amount;
	message.textContent = result.eventInfo[0].message;

}

// Window onload function
window.addEventListener('load', async () => {
	loadEventDetail();
});
