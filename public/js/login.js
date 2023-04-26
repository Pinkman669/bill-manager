
document
    .querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
  
    const form = event.target
    let requestBody = {}
    
    requestBody.email = form.email.value;
    requestBody.password = form.password.value;
  
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    const status = await res.json()
    form.reset()
    if (status.success === false){
        document.querySelector("#invalid-message").textContent = "Incorrect email or password."
    }
    window.location = '/landing.html'
  })