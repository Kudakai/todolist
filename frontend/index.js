const addButton = document.querySelector('#add_button')
const input = document.querySelector('#inputField')
const todoContainer = document.querySelector('.todo-list')

function renderTodo(todo) {
    const newLi = document.createElement('li')
    newLi.id = todo.id
    newLi.innerHTML = `<input class="check" type="checkbox" ${todo.state === true ? "checked" : ""} /><span>${todo.todo}</span><button class="delete">Delete</button>`
    const checkbox = newLi.querySelector('.check')
    const deleteBtn = newLi.querySelector('.delete')
    checkbox.addEventListener('change', (e) => {
        const element = e.target.parentElement
        const request = { 
            id: element.id, 
            todo: element.querySelector('span').textContent,
            state: element.querySelector('.check').checked
        }
        console.log(request)
        fetch('/changetodostate', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ request })
    })
    })

        deleteBtn.addEventListener('click', (e) => {
        const element = e.target.parentElement
        const request = {
            id: element.id
        }
        fetch('/deleteTodo', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({request})
        })
    })
    todoContainer.appendChild(newLi)
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/listAllTodos')
        .then((data) => {
            return data.json()
        })
        .then((allTodos) => {
            for(let i = 0; i < allTodos.length; i++){
                renderTodo(allTodos[i])
            }
        })
})

addButton.addEventListener('click', () => {
    const text = input.value.trim()

    if (!text) return

    fetch('/addTodo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(parsedData => {
        input.value = ''
        todoContainer.innerHTML = ''

        for (let i = 0; i < parsedData.length; i++) {
            renderTodo(parsedData[i])
        }
    })
    .catch(err => {
        console.error(err)
    })
})