// Load user info
async function loadUser() {
	const res = await fetch('/friends');
	const result = await res.json();
	const username = document.querySelector('#greet-user');
	const userPic = document.querySelector('.member-pic-div');
	const oweDiv = document.querySelector('#user-owe-div')
	const oweTable = document.querySelector('#user-owe-detail');
	const creditDiv = document.querySelector('#user-credit-div')
	const creditTable = document.querySelector('#user-credit-detail');
	const balanceTag = document.querySelector('#user-balance');
	const maxDisplay = window.innerWidth > 390 ? 5 : 3;
	balanceTag.textContent = result.totalBalance;
	// const balance = document.querySelector('#user-balance')
	username.textContent = result.user[0].nickname;
	userPic.innerHTML += `<img src="${
		result.user[0].image
			? `uploads/${result.user[0].image}`
			: `image/default_profile.jpg`
	}" 
    alt="profile-image" class="profile-pic" />`;

	for (let i = 0; i < result.friendsRecords.length; i++) {
		if (result.friendsRecords[i].friendsAmount < 0) {
			oweTable.innerHTML += `<tr class="animate__animated ${i >= maxDisplay ? `invisible hide` : `animate__animated animate__bounceIn`}">
                                        <th scope="row">
                                            <a href="#" userID="${
												result.friendsRecords[i]
													.friendsID
											}">${
				result.friendsRecords[i].friendsName
			}</a>
                                            <img class="users-pic" src="${
												result.friendsRecords[i].image
													? `uploads/${result.friendsRecords[i].image}`
													: `image/default_profile.jpg`
											}">
                                        </th>
                                        <td>${
											result.friendsRecords[i]
												.friendsAmount
										}</td>
                                    </tr>`;
		} else {
			creditTable.innerHTML += `<tr class="${i >= maxDisplay ? `invisible hide` : `animate__animated animate__bounceIn`}">
                                        <th scope="row">
                                            <a href="#" userID="${
												result.friendsRecords[i]
													.friendsID
											}">${
				result.friendsRecords[i].friendsName
			}</a>
                                            <img class="users-pic" src="${
												result.friendsRecords[i].image
													? `uploads/${result.friendsRecords[i].image}`
													: `image/default_profile.jpg`
											}">
                                        </th>
                                        <td>+${
											result.friendsRecords[i]
												.friendsAmount
										}</td>
                                    </tr>`;
		}
	}
	oweDiv.innerHTML += `<div class="load-btn-div"><button type="button" state="load" load="owe" class="btn btn-dark loadMore-Btn">Load more</button></div>`
	creditDiv.innerHTML += `<div class="load-btn-div"><button type="button" state="load" load="credit" class="btn btn-dark loadMore-Btn">Load more</button></div>`

	// load/collapse user detail
	const loadMoreBtns = [...document.querySelectorAll('.loadMore-Btn')]
	for (let i in loadMoreBtns){
		loadMoreBtns[i].addEventListener('click', (e)=>{
			const btnState = loadMoreBtns[i].getAttribute('state')
			if (btnState === 'load'){
				const hidedRows = loadMoreBtns[i].getAttribute('load') === "owe" ? oweDiv.querySelectorAll('.hide') 
								: creditDiv.querySelectorAll('.hide')
				for (let j = 0; j < hidedRows.length; j++){
					hidedRows[j].classList.remove('invisible')
					if (hidedRows[j].classList.contains('animate__bounceOut')){
						hidedRows[j].classList.remove('animate__bounceOut')
					}
					hidedRows[j].classList.add('animate__bounceIn')
				}
				loadMoreBtns[i].textContent = 'Collapse'
				loadMoreBtns[i].setAttribute('state', 'collapse')
			} else if (btnState === 'collapse'){
				const showedRows = loadMoreBtns[i].getAttribute('load') === "owe" ? oweDiv.querySelectorAll('.hide') 
								: creditDiv.querySelectorAll('.hide')
				for (let j = 0; j < showedRows.length; j++){
					showedRows[j].classList.replace('animate__bounceIn', 'animate__bounceOut')
					setTimeout(()=>{
						showedRows[j].classList.add('invisible')
					},700)
				}
				loadMoreBtns[i].textContent = 'Load More'
				loadMoreBtns[i].setAttribute('state', 'load')
			}
		})
	}
}

// Window onload function
window.addEventListener('load', async () => {
	await loadUser();
});
