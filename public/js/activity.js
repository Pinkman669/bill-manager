import {
	searchUsers,
	addFriend,
	loadFriend,
	loadGroups,
	selectType
} from './addFriend.js';
import { animateCSS } from './exportFn.js';

// Declare variable
const dividedBy = document.getElementById('denominator');
const requestorBtn = document.querySelector('#requestor');
const resMsgBox = document.querySelector('.alert');

// Modal btns DOM //
// Select types display/hidden modal
document.querySelectorAll('.select-type').forEach((typeBtn) => {
	const groupDiv = document.querySelector('#selection-type-group');
	const friendDiv = document.querySelector('#selection-type-person');
	typeBtn.addEventListener('change', (e) => {
		if (typeBtn.checked && typeBtn.value === 'group') {
			groupDiv.classList.remove('invisible');
			friendDiv.classList.add('invisible');
			animateCSS(groupDiv, 'animate__fadeInRight');
		}
		if (typeBtn.checked && typeBtn.value === 'person') {
			friendDiv.classList.remove('invisible');
			groupDiv.classList.add('invisible');
			animateCSS(friendDiv, 'animate__fadeInLeft');
		}
	});
});

// Modal close btn
document
	.querySelector('#add-friend-modal')
	.addEventListener('hidden.bs.modal', async (e) => {
		await LoadSelector();
		const splitMethodBtns = [...document.querySelectorAll('.split-method')];
		splitMethodBtns.forEach(async (method) => {
			if (method.checked) {
				await LoadFriendsInput(method.value);
			}
		});
	});

// resMsg close btn
document.querySelectorAll('.alert').forEach((msg) => {
	msg.querySelector('.btn-close').addEventListener('click', (e) => {
		msg.classList.replace('show', 'collapse');
	});
});

// Search users name
document.querySelector('#searchUser').addEventListener('input', async (e) => {
	await searchUsers();
});

// Add friend btn
document
	.querySelector('#add-friend-btn')
	.addEventListener('click', async (e) => {
		e.preventDefault();
		await addFriend();
	});

// Render paid by select option
async function LoadSelector() {
	const res = await fetch('/home');
	const result = await res.json();
	requestorBtn.innerHTML = '';
	const selectedFriends = [...document.querySelectorAll('.friend-input')];
	const newOpt = document.createElement('option');
	newOpt.value = result.userInfo.userID;
	newOpt.textContent = 'You';
	requestorBtn.appendChild(newOpt);
	selectedFriends.forEach((friend) => {
		if (friend.checked) {
			const newOpt = document.createElement('option');
			newOpt.value = friend.value;
			newOpt.textContent = friend.getAttribute('friend-name');
			requestorBtn.appendChild(newOpt);
		}
	});
}

// Render users in payment input section (evenly disabled)
async function LoadFriendsInput(method) {
	const res = await fetch('/home');
	const result = await res.json();
	const userAmountBox = document.querySelector(
		'.container-fluid.users-amount'
	);
	userAmountBox.innerHTML = '';
	const selectedFriends = [...document.querySelectorAll('.friend-input')];
	userAmountBox.innerHTML += `<div class="selected-user-div">
                                    <div class="selected-input-div">
                                        <input class="usersCheckBox" type="checkbox" value="${
											result.userInfo.userID
										}" name="${
		result.userInfo.userName
	}" form="activity-form" ${
		requestorBtn.value == result.userInfo.userID ? `disabled` : `checked`
	}>
                                        <label >You ${
											method === 'evenly' ||
											method === 'custom'
												? `$`
												: `shares`
										}</label>
                                    </div>
                                    <input input-type="amount" class="usersAmountInput" type="number" name="${
										result.userInfo.userName
									}-amount" form="activity-form" ${
		method === 'evenly' ? `disabled` : `required`
	} ${requestorBtn.value == result.userInfo.userID ? `disabled` : ``} min="1">
                                </div>`;
	selectedFriends.forEach((friend) => {
		if (friend.checked) {
			const friendName = friend.getAttribute('friend-name');
			const friendID = friend.value;
			userAmountBox.innerHTML += `<div class="selected-user-div">
                                            <div class="selected-input-div">
                                                <input class="usersCheckBox" type="checkbox" value="${friendID}" name="${friendName}" form="activity-form" ${
				requestorBtn.value == friendID ? `disabled` : `checked`
			}>
                                                <label >${friendName}: ${
				method === 'evenly' || method === 'custom' ? `$` : `shares`
			}</label>
                                            </div>
                                            <input input-type="amount" class="usersAmountInput" type="number" name="${friendID}-amount" form="activity-form" ${
				method === 'evenly' ? `disabled` : `required`
			} ${requestorBtn.value == friendID ? `disabled` : ``} min="1">
                                        </div>`;
		}
	});
	userCheckBoxChange();
}

// Rendering payment input depends on split-method
function splitMethod() {
	const splitMethodBtns = [...document.querySelectorAll('.split-method')];
	splitMethodBtns.forEach((method) => {
		method.addEventListener('change', async (e) => {
			if (document.querySelectorAll('.selection').length < 1) {
				e.target.checked = false;
				return resMsgTrigger(false, 'Please select users');
			} else if (document.querySelector('#total-amount').value < 1) {
				e.target.checked = false;
				return resMsgTrigger(false, 'Please enter total amount');
			}
			if (e.target.value === 'evenly') {
				return await LoadFriendsInput('evenly');
			} else if (e.target.value === 'shares') {
				return await LoadFriendsInput('shares');
			} else if (e.target.value === 'custom') {
				return await LoadFriendsInput('custom');
			}
		});
	});
}

// Submit form
// function submitActivity(){
document.querySelector('#form-submit-btn').addEventListener(
	'click',
	async (e) => {
		console.log(e.target);
		e.preventDefault();

		// Reject split method not selected
		const splitMethodBtns = [...document.querySelectorAll('.split-method')];
		let methodChecked = false;
		for (let method of splitMethodBtns) {
			if (method.checked) {
				if (method.value === 'shares') {
					if (document.querySelector('#denominator').value > 0) {
						methodChecked = true;
					}
				} else {
					methodChecked = true;
				}
			}
		}
		const inputFields = [...document.querySelectorAll('input')];
		for (let inputField of inputFields) {
			if (
				inputField.getAttribute('input-type') === 'amount' &&
				inputField.value <= 0 &&
				!inputField.disabled
			) {
				resMsgBox.classList.replace('alert-success', 'alert-warning');
				resMsgBox.classList.replace('collapse', 'show');
				resMsgBox.querySelector('.resMsg').textContent =
					'Amount cannot be 0 or below';
				return;
			}
			if (!inputField.checkValidity()) {
				methodChecked = false;
			}
		}
		if (!methodChecked) {
			resMsgBox.classList.replace('alert-success', 'alert-warning');
			resMsgBox.classList.replace('collapse', 'show');
			resMsgBox.querySelector('.resMsg').textContent =
				'Please fill out the form';
			return;
		}
		const form = document.querySelector('#activity-form');
		const formObj = {
			actName: form['event-name'].value,
			actDate: form['event-date'].value,
			totalAmount: form['total-amount'].value,
			message: form.message.value,
			receiversInfo: {
				userID: [],
				userAmount: []
			},
			requestorID: requestorBtn.value
		};
		const splitMethod = [...document.querySelectorAll('.split-method')];
		splitMethod.forEach((method) => {
			if (method.checked) {
				if (method.value === 'shares') {
					formObj.method = {
						shares: document.querySelector('#denominator').value
					};
				} else {
					formObj.method = method.value;
				}
			}
		});
		const receiversID = [...document.querySelectorAll('.usersCheckBox')];
		const receiversAmount = [
			...document.querySelectorAll('.usersAmountInput')
		];
		receiversID.forEach((receiver, i) => {
			if (receiver.checked) {
				if (receiversAmount[i].value > 0) {
					formObj.receiversInfo.userID.push(receiver.value);
					formObj.receiversInfo.userAmount.push(
						receiversAmount[i].value
					);
				} else if (formObj.method === 'evenly') {
					formObj.receiversInfo.userID.push(receiver.value);
					const place = 1;
					formObj.receiversInfo.userAmount.push(1);
				}
			}
		});

		const res = await fetch('activity/create-activity', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});
		const result = await res.json();
		if (result.success) {
			// form.reset()
			resMsgBox.classList.replace('alert-warning', 'alert-success');
			document.querySelector('.container-fluid.users-amount').innerHTML =
				'';
		} else {
			resMsgBox.classList.replace('alert-success', 'alert-warning');
		}
		resMsgBox.classList.replace('collapse', 'show');
		resMsgBox.querySelector('.resMsg').textContent = result.msg;
	},
	'#activity-form'
);
// }

// input option on change select
requestorBtn.addEventListener('change', (e) => {
	const usersCheckBox = [...document.querySelectorAll('.usersCheckBox')];
	const usersAmountInput = [
		...document.querySelectorAll('.usersAmountInput')
	];
	usersCheckBox.forEach((user, i) => {
		if (user.value === requestorBtn.value) {
			user.checked = false;
			user.disabled = true;
			usersAmountInput[i].disabled = true;
		} else if (!document.querySelector('#equally').checked) {
			user.checked = true;
			user.disabled = false;
			usersAmountInput[i].disabled = false;
		}
	});
});

// user amount checkbox on change
function userCheckBoxChange() {
	document.querySelectorAll('.usersCheckBox').forEach((userCheckBox, i) => {
		const usersAmountInput = [
			...document.querySelectorAll('.usersAmountInput')
		];
		userCheckBox.addEventListener('change', (e) => {
			if (!e.target.checked) {
				usersAmountInput[i].disabled = true;
			}
			if (e.target.checked) {
				usersAmountInput[i].disabled = false;
			}
		});
	});
}

// resMsg trigger Fn
function resMsgTrigger(msgType, msgContent) {
	const resMsgBox = document.querySelector('.alert');
	if (msgType) {
		resMsgBox.classList.replace('alert-warning', 'alert-success');
	} else {
		resMsgBox.classList.replace('alert-success', 'alert-warning');
	}
	resMsgBox.classList.replace('collapse', 'show');
	resMsgBox.querySelector('.resMsg').textContent = msgContent;
}

window.addEventListener('load', async () => {
	await loadFriend();
	await LoadSelector();
	await loadGroups();
	splitMethod();
	selectType();
});
