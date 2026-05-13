const addButton = document.querySelector('#add_button')
const input = document.querySelector('#inputField')
const todoContainer = document.querySelector('.todo-list')
const completedTasksValue = document.getElementById('completed_tasks_value')
const uncompletedTasksValue = document.getElementById('uncompleted_tasks_value')
const totalTasksValue = document.getElementById('total_tasks_value')
const emptyInputWarning = document.getElementById('input_error')
const datePickerInput = document.getElementById('date')
const dateApplyBtn = document.getElementById('apply_date_button')

async function requestAllTodos(date) {
    const response = await fetch(`/listAllTodos?date=${date}`)
    const todos = await response.json()
    return todos
}

function updateStatistics(todoList) {
    totalTasksValue.textContent = todoList.length
    completedTasksValue.textContent = todoList.filter((todo) => {
        return todo.state == true
    }).length
    uncompletedTasksValue.textContent = todoList.filter((todo) => {
        return todo.state == false
    }).length
}

function updateDate(){
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    datePickerInput.value = formattedDate
}

function renderTodo(todo) {
    const newLi = document.createElement('li')
    newLi.id = todo.id
    newLi.innerHTML = `<input class="check" type="checkbox" ${todo.state === 1 ? "checked" : ""} /><span>${todo.todo}</span><button class="delete">Delete</button>`
    const checkbox = newLi.querySelector('.check')
    const deleteBtn = newLi.querySelector('.delete')
    checkbox.addEventListener('change', async (e) => {
        const element = e.target.parentElement
        const request = { 
            id: element.id, 
            todo: element.querySelector('span').textContent,
            state: element.querySelector('.check').checked
        }
        const reponseFromServer = await fetch('/changetodostate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request })})
        const todos = await reponseFromServer.json()

        updateStatistics(todos)
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
        .then((response) => {
            return response.text()
        })
        .then((response) => {
            return JSON.parse(response)
        })
        .then((response) => {
            if(response){
                document.getElementById(response.deletedElement.id).remove()
                updateStatistics(response.newTodoList)
            }
        })
    })
    todoContainer.appendChild(newLi)
}

document.addEventListener('keydown', (e) => {
    if(e.key === "Enter"){
         const text = input.value.trim()

    if (!text){
        emptyInputWarning.classList.remove('hidden')
        return
    }

    emptyInputWarning.classList.add('hidden')

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
        updateStatistics(parsedData)
    })
    .catch(err => {
        console.error(err)
    })
    }
})



function renderAllTodos(todos) {
    for(let i = 0; i < todos.length; i++){
        renderTodo(todos[i])
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try{
        updateDate()
        const allTodos = await requestAllTodos(datePickerInput.value)
        renderAllTodos(allTodos)
        updateStatistics(allTodos)
        

    }catch(err){
        console.error(err)
    }

})

addButton.addEventListener('click', () => {
    const text = input.value.trim()

    if (!text){
        emptyInputWarning.classList.remove('hidden')
        return
    }

    emptyInputWarning.classList.add('hidden')

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
        updateStatistics(parsedData)
    })
    .catch(err => {
        console.error(err)
    })
})