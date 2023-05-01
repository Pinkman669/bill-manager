// Declare variable
const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('.profile-pic');
const file = document.querySelector('#image');
const uploadBtn = document.querySelector('.image-upload-btn');
const resMsg = document.querySelector('#res-msg');

// Sign up btn
document
	.querySelector('#sign-up-form')
	.addEventListener('submit', async (e) => {
		e.preventDefault();

		const form = e.target;
		const password = form.password.value;
		const confirmPw = form['confirm-password'].value;
		const formData = new FormData(form);
		form.reset();
		if (password !== confirmPw) {
			resMsg.classList.replace('alert-success', 'alert-danger');
			resMsg.classList.remove('invisible');
			resMsg.textContent = 'Password not match';
			return;
		}

		const res = await fetch('/sign', {
			method: 'POST',
			body: formData
		});

		const result = await res.json();
		if (result.success) {
			resMsg.classList.replace('alert-danger', 'alert-success');
			resMsg.classList.remove('invisible');
			resMsg.textContent = result.msg;
		} else {
			resMsg.classList.replace('alert-success', 'alert-danger');
			resMsg.classList.remove('invisible');
			resMsg.textContent = result.msg;
		}
	});

// image upload functionality
// Change profile img display instantly
file.addEventListener('change', (e) => {
	const [newImg] = e.target.files;
	if (newImg) {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			img.setAttribute('src', reader.result);
		});
		reader.readAsDataURL(newImg);
	}
});
