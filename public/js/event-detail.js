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
	const settle = document.querySelector('#settle');
	


	
	eventName.textContent = result.eventInfo[0].name;
	eventDate.textContent = new Date(result.eventInfo[0].date).toDateString();
	ownAmount.textContent = result.eventInfo[0].record_amount;
	friendsInvolved.textContent = `${result.req[0].nickname}, ${result.res[0].nickname}`;
	billTotal.textContent =  result.eventInfo[0].total_amount;
	message.textContent = result.eventInfo[0].message;
	settle.textContent = (result.eventInfo[0].due?"Settled":"Unsettle")
	if (result.eventInfo[0].method === "evenly"){
		splitMethod.textContent = 'Split evenly'
	}else if (result.eventInfo[0].method === "custom"){
		splitMethod.textContent = 'custom';
	}else {
		const shares = JSON. parse(result.eventInfo[0].method).shares
		console.log(shares);
		splitMethod.textContent = `Split in ${shares} ways`;
	}

}

// Window onload function
window.addEventListener('load', async () => {
	loadEventDetail();
});
