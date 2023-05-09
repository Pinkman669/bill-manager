import { animateCSS, loadPic } from './exportFn.js';
async function loadFriends() {
	const res = await fetch('/friends');
	const result = await res.json();
	const username = document.querySelector('#username');
	const balanceTag = document.querySelector('#user-balance');
	const friendTable = document.querySelector('#friends-table');

	let balance = result.totalBalance;
	// const balance = document.querySelector('#user-balance')
	username.textContent = result.user[0].nickname;

	balanceTag.textContent = balance;

	for (let i in result.friendsRecords) {
		if (result.friendsRecords[i].friendsAmount > 0) {
			// console.log(`+ amount`);
			friendTable.innerHTML += `
								<div class="friends-div>
                                <div class="friends-detail-div"> 
								<div class="group-name">
                                    <a href="/friendsdetail.html?friendID=${
										result.friendsRecords[i].friendID
									}" userID="${
				result.friendsRecords[i].friendID
			}">${result.friendsRecords[i].friendsName}</a>
                                    <img class="users-pic" src="${
										result.friendsRecords[i].friendsImage
											? `uploads/${result.friendsRecords[i].friendsImage}`
											: `image/default_profile.jpg`
									}">
                                </div>
                                    </div>   
                                    <div class="amount-div group-amount"> You lent $ ${
										result.friendsRecords[i].friendsAmount
									}</div>
                                </div>
								</div>
								<hr>
                                `;
		} else if (result.friendsRecords[i].friendsAmount < 0) {
			// console.log(`- amount`);
			let ownAmount = result.friendsRecords[i].friendsAmount;
			let amount = ownAmount * -1;
			friendTable.innerHTML += `
			<div class="friends-div>
				<div class="friends-detail-div">
					<div>
						<a href="/friendsdetail.html?friendID=${
							result.friendsRecords[i].friendID
						}" userID="${result.friendsRecords[i].friendID}">${
				result.friendsRecords[i].friendsName
			}</a>
						<img class="users-pic" src="${
							result.friendsRecords[i].friendsImage
								? `uploads/${result.friendsRecords[i].friendsImage}`
								: `image/default_profile.jpg`
						}">
					</div>
				</div>   
					<div class="amount-div"> You borrowed $ ${amount}</div>
				</div>
			</div>
			<hr>
			`;
		}
	}
}

// Window onload function
window.addEventListener('load', async () => {
	loadFriends();
	await loadPic();
});
