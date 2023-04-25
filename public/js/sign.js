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


// image upload functionality
const imgDiv = document.querySelector('.profile-pic-div')
const img = document.querySelector('.profile-pic')
const file = document.querySelector('#image')
const uploadBtn = document.querySelector('.image-upload-btn')

// Change profile img display instantly
file.addEventListener('change', (e)=>{
    const [newImg] = e.target.files
    if (newImg){
        const reader = new FileReader()
        reader.addEventListener('load', ()=>{
            img.setAttribute('src', reader.result)
        })
        reader.readAsDataURL(newImg)
    }
})