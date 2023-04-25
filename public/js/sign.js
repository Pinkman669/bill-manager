// Sign up btn
document
	.querySelector('#sign-up-form')
	.addEventListener('submit', async (e) => {
		e.preventDefault();

		const form = e.target;
		let formObject = {
			email: form.email.value,
			password: form.password.value,
			nickname: form.nickname.value,
			image: form.image.value
		};

		const res = await fetch('/sign', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObject)
		});
		form.reset();

		const result = await res.json();
		console.log(result.success);
	});
