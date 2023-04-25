// Sign up btn
document
	.querySelector('#sign-up-form')
	.addEventListener('submit', async (e) => {
		e.preventDefault();

		const form = e.target;
		const formData = new FormData(form);

		const res = await fetch('/sign', {
			method: 'POST',
			body: formData
		});
		form.reset();

		const result = await res.json();
		console.log(result.success);
	});
