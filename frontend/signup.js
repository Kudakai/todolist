const form = document.querySelector('form')

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
    }catch (err){
        console.log(err)
    }
})