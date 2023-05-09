export async function loadFriend() {
	const modalDiv = document.querySelector('#friendList-div');
	const res = await fetch('/activity');
	const result = await res.json();
	if (result.success) {
		modalDiv.innerHTML = '';
		for (let i in result.friendList) {
			const friend = result.friendList[i];
			modalDiv.innerHTML += `<div class="friend-name-div">
                                            <label for="${friend.user_id}">
                                                <input type="checkbox" class="friend-input" value="${friend.user_id}" id="${friend.user_id}" friend-name="${friend.nickname}">
                                                <span class="friend-name">${friend.nickname}</span>
                                            </label>
                                        </div>`;
		}
	}
	// Display friend name
	const selectedUsersDiv = document.querySelector('#selected-friends-div');
	const friendBoxes = [...document.querySelectorAll('.friend-input')];
	friendBoxes.forEach((friendBox) => {
		friendBox.addEventListener('change', (e) => {
			if (friendBox.checked) {
				const friendName = friendBox.getAttribute('friend-name');
				const newP = document.createElement('p');
				newP.classList.add('selected-name');
				newP.classList.add('selection');
				newP.setAttribute('friend-name', friendName);
				newP.setAttribute('selectType', 'person');
				const newContent = document.createTextNode(friendName);
				newP.appendChild(newContent);
				selectedUsersDiv.appendChild(newP);
			}
			if (!friendBox.checked) {
				const selectedUsers = [
					...document.querySelectorAll('.selected-name')
				];
				selectedUsers.forEach((user) => {
					if (
						user.getAttribute('friend-name') ===
						friendBox.getAttribute('friend-name')
					) {
						selectedUsersDiv.removeChild(user);
					}
				});
			}
		});
	});
}

// Auto suggestions on input username
export async function searchUsers() {
	const modalUsersDiv = document.querySelector('#Add-friends-div');
	const nameInput = document.querySelector('#searchUser').value;
	const res = await fetch(`/activity/searchUsers/${nameInput}`);
	const result = await res.json();
	console.log(result);

	if (result.success) {
		// for (let i in result.usersList){
		//     const userInfo = result.usersList[i]
		// modalUsersDiv.innerHTML += `<div class="user-name-div">
		//                             <label for="${userInfo.id}">
		//                                 <input type="checkbox" id="${userInfo.id}" class="user-input" value="${userInfo.id}" userName="${userInfo.nickname}" form="add-friends-form">
		//                                 <span class="user-name">${userInfo.nickname}</span>
		//                             </label>
		// 				        </div>`
		// }
		const dataList = document.querySelector('datalist#searchUsers');
		dataList.innerHTML = '';
		for (let i in result.usersList) {
			const userInfo = result.usersList[i];
			const newOpt = document.createElement('option');
			newOpt.value = userInfo.email;
			newOpt.setAttribute('userID', userInfo.id);
			dataList.appendChild(newOpt);
		}
	}
}

export async function addFriend() {
	const form = document.querySelector('#add-friends-form');
	const userNameInput = document.querySelector('#searchUser').value;
	form.reset();
	const res = await fetch('/activity/addFriend', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ userNameInput })
	});
	const result = await res.json();
	if (result.success) {
		const selectedFriendDiv = document.querySelector(
			'#selected-friends-div'
		);
		selectedFriendDiv.innerHTML = '';
		await loadFriend();
	} else {
		const resMsgBox = document.querySelector('#addFriend-resMsg');
		resMsgBox.querySelector('.resMsg').textContent = result.msg;
		resMsgBox.classList.replace('collapse', 'show');
	}
}

export async function loadGroups() {
	const groupDiv = document.querySelector('#groups-div');
	const res = await fetch('/activity/loadGroups');
	const result = await res.json();
	if (result.success) {
		groupDiv.innerHTML = '';
		for (let i in result.userGroup) {
			const groupInfo = result.userGroup[i];
			// console.log(result.groupsInfo[groupInfo.id])
			groupDiv.innerHTML += `<div class="user-group-div">
                                        <label for="${groupInfo.name}-${groupInfo.id}">
                                            <input type="radio" name="group-input" id="${groupInfo.name}-${groupInfo.id}" class="group-input" value="${groupInfo.id}" group-name="${groupInfo.name}" disabled>
                                            <span class="group-name">${groupInfo.name}</span>
                                        </label>
        					        </div>`;
		}
	}
	// Display group and load group member into it
	const selectedUsersDiv = document.querySelector('#selected-friends-div');
	const groupBoxes = [...document.querySelectorAll('.group-input')];
	groupBoxes.forEach((groupBox) => {
		groupBox.addEventListener('change', (e) => {
			selectedUsersDiv.innerHTML = '';
			const groupName = groupBox.getAttribute('group-name');
			const newDiv = document.createElement('div');
			newDiv.classList.add('selected-group');
			newDiv.classList.add('selection');
			newDiv.setAttribute('group-id', groupBox.value);
			newDiv.setAttribute('selectType', 'group');
			const newContent = document.createTextNode(groupName);
			newDiv.appendChild(newContent);
			selectedUsersDiv.appendChild(newDiv);
			// display group members
			for (let userInfo of result.groupsInfo[groupBox.value]) {
				const newInput = document.createElement('input');
				newInput.checked = true;
				newInput.value = userInfo.userID;
				newInput.classList.add('friend-input');
				newInput.setAttribute('friend-name', userInfo.userName);
				newInput.setAttribute('selectType', 'group');
				const newContent = document.createTextNode(userInfo.userName);
				newInput.appendChild(newContent);
				newDiv.appendChild(newInput);
			}
			// if (!groupBox.checked) {
			//     const selectedGroups = [...document.querySelectorAll('.selected-group')]
			//     selectedGroups.forEach((group) => {
			//         if (group.getAttribute('group-id') === groupBox.value) {
			//             console.log(group)
			//             selectedUsersDiv.removeChild(group)
			//         }
			//     })
			// }
		});
	});
}

export function clearSelection(type) {
	const selectedFriendDiv = document.querySelector('#selected-friends-div');
	const selectedItems = [...selectedFriendDiv.querySelectorAll('.selection')];
	selectedItems.forEach((item) => {
		if (item.getAttribute('selectType') === type) {
			console.log(item);
			selectedFriendDiv.removeChild(item);
		}
	});
}

export function selectType() {
	const selectTypeBoxes = [...document.querySelectorAll('.select-type')];
	selectTypeBoxes.forEach((typeBox) => {
		typeBox.addEventListener('change', async (e) => {
			if (typeBox.checked && typeBox.value === 'person') {
				clearSelection('group');
				document.querySelectorAll('.group-input').forEach((input) => {
					input.checked = false;
					input.disabled = true;
				});
				document.querySelectorAll('.friend-input').forEach((input) => {
					input.disabled = false;
				});
			}
			if (typeBox.checked && typeBox.value === 'group') {
				clearSelection('person');
				document.querySelectorAll('.friend-input').forEach((input) => {
					input.checked = false;
					input.disabled = true;
				});
				document.querySelectorAll('.group-input').forEach((input) => {
					input.disabled = false;
				});
			}
		});
	});
}
