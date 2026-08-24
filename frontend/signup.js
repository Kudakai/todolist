const form = document.querySelector('form')
const emailError = document.querySelector('.email.error')
const passwordError = document.querySelector('.password.error')

function hideAllErrors(){
    emailError.innerHTML = ""
    emailError.classList.add('hidden')

    passwordError.innerHTML = ""
    passwordError.classList.add('hidden')
}

function renderEmailValidationError(){
    emailError.innerHTML = '<p>The email is not valid</p>'
    emailError.classList.remove('hidden')
}

function renderPasswordValidationError(){
    passwordError.innerHTML = '<p>The password is not valid</p>'
    passwordError.classList.remove('hidden')
}

function renderEmailDuplicationError(){
    emailError.innerHTML = '<p>The email is already in use</p>'
    emailError.classList.remove('hidden')
}


form.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideAllErrors()
    const email = form.email.value
    const password = form.password.value

    try{
        const response = await fetch('/signup', {method: 'POST',
                                            body: JSON.stringify({
                                                email: email, password: password
                                                  }),
                                            headers: {'Content-Type': 'application/json'}
        })
        const data = await response.json()
        if(data.errorId === 1){
            renderEmailValidationError()
        } else if(data.errorId === 2){
            renderPasswordValidationError()
        } else if(data.errorId === 3){
            renderEmailDuplicationError()
        }
    } catch (err){
        
        }
    })