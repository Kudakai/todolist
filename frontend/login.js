const form = document.querySelector('form')
const emailError = document.querySelector('.email.error')
const passwordError = document.querySelector('.password.error')

function hideAllErrors(){
    emailError.innerHTML = ""
    emailError.classList.add('hidden')

    passwordError.innerHTML = ""
    passwordError.classList.add('hidden')
}

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideAllErrors()
    const email = form.email.value
    const password = form.password.value

    try{
        const response = await fetch('/login', {method: 'POST',
                                            body: JSON.stringify({
                                                email: email, password: password
                                                  }),
                                            headers: {'Content-Type': 'application/json'}
        })
        const data = await response.json()
    } catch (err){
        
        }
})