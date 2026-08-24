const form = document.querySelector('form')
const emailError = document.querySelector('.email_error')


form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = form.email.value
    const password = form.password.value
    try{
            const res = await fetch('/signup', {
            method: 'POST',
            body: JSON.stringify({
                email: email, password: password
            }),
            headers: {'Content-Type': 'application/json'}
        })
        const data = await res.json()
        console.log(data)
        if(data.errorNumber === 1062){
            emailError.innerHTML = '<p>This email is already exists</p>'
            emailError.classList.remove('hidden')
        }
    }catch (err){
        console.log(err)
        }
    })