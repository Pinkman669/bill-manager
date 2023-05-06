const searchParams = new URLSearchParams(location.search);
const id = searchParams.get("recordId"); 

async function loadFriendsDetail() {
	const res = await fetch(`/eventdetail/${id}`);
	const result = await res.json();
    const splitMethod = document.querySelector('#split-method');
}