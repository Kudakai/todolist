const form = document.querySelector('form')
const emailError = document.querySelector('.email.error')
const passwordError = document.querySelector('.password.error')

function hideAllErrors(){
    emailError.innerHTML = ""
    emailError.classList.add('hidden')

    passwordError.innerHTML = ""
    passwordError.classList.add('hidden')
}

function renderNoEmailError() {
    emailError.innerHTML = '<p>User not found</p>'
    emailError.classList.remove('hidden')
}

function renderEmailValidationError(){
    emailError.innerHTML = '<p>The email is not valid</p>'
    emailError.classList.remove('hidden')
}

function renderWrongPasswordError(){
    passwordError.innerHTML = '<p>The password is wrong</p>'
    passwordError.classList.remove('hidden')
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

    if (data.err?.errorId === 1) {
    renderEmailValidationError()

    } else if (data.err?.errorId === 2) {
    renderNoEmailError()

    } else if (data.err?.errorId === 3) {
    renderWrongPasswordError()

    } else if (data.userId) {
    location.assign('/')
    }
        } catch (err){
        
        }
})