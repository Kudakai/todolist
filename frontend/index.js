const addButton = document.querySelector('#add_button')
const input = document.querySelector('#inputField')
const todoContainer = document.querySelector('.todo-list')

function renderTodo(todo) {
    const newLi = document.createElement('li')
    newLi.innerHTML = `<input type="checkbox" /><span>${todo}</span>`
    todoContainer.appendChild(newLi)
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/listAllTodos')
        .then((data) => {
            return data.json()
        })
        .then((allTodos) => {
            for(i = 0; i < allTodos.length; i++){
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