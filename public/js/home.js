// Load user info
async function loadUser() {
	const res = await fetch('/home');
	const result = await res.json();
	const username = document.querySelector('#greet-user');
	const userPic = document.querySelector('.member-pic-div');
	const oweLoadBtn = document.querySelector('#borrowed');
	const oweTable = document.querySelector('#user-owe-detail');
	const creditLoadBtn = document.querySelector('#lent');
	const creditTable = document.querySelector('#user-credit-detail');
	const balanceTag = document.querySelector('#user-balance');
	const maxDisplay = window.innerWidth > 390 ? 5 : 3;
	balanceTag.textContent = result.totalBalance;
	username.textContent = result.userInfo.userName;
	userPic.innerHTML += `<img src="${
		result.userInfo.image
			? `uploads/${result.userInfo.image}`
			: `image/default_profile.jpg`
	}" 
    alt="profile-image" class="profile-pic" />`;

	for (let i = 0; i < result.requestorInfo.length; i++) {
		const requestorInfo = result.requestorInfo[i];
		oweTable.innerHTML += `<tr class="animate__animated ${
			i >= maxDisplay
				? `invisible hide`
				: `animate__animated animate__bounceIn`
		}">
										<th scope="row">
											<a href="/friendsdetail.html?friendID=${requestorInfo.id}" userID="${
			requestorInfo.id
		}">${requestorInfo.nickname}</a>
											<img class="users-pic" src="${
												requestorInfo.image
													? `uploads/${requestorInfo.image}`
													: `image/default_profile.jpg`
											}">
										</th>
										<td>-${requestorInfo.amount}</td>
									</tr>`;
	}
	for (let i = 0; i < result.receiverInfo.length; i++) {
		const receiverInfo = result.receiverInfo[i];
		creditTable.innerHTML += `<tr class="${
			i >= maxDisplay
				? `invisible hide`
				: `animate__animated animate__bounceIn`
		}">
									<th scope="row">
										<a href="/friendsdetail.html?friendID=${receiverInfo.id}" userID="${
			receiverInfo.id
		}">${receiverInfo.nickname}</a>
										<img class="users-pic" src="${
											receiverInfo.image
												? `uploads/${receiverInfo.image}`
												: `image/default_profile.jpg`
										}">
									</th>
									<td>+${receiverInfo.amount}</td>
								</tr>`;
	}
}

// Window onload function
window.addEventListener('load', async () => {
	await loadUser();
});
