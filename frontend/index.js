const addButton = document.querySelector('#add_button')
const input = document.querySelector('#inputField')
const todoContainer = document.querySelector('.todo-list')
const completedTasksValue = document.getElementById('completed_tasks_value')
const uncompletedTasksValue = document.getElementById('uncompleted_tasks_value')
const totalTasksValue = document.getElementById('total_tasks_value')
const emptyInputWarning = document.getElementById('input_error')
const datePickerInput = document.getElementById('date')
const dateApplyBtn = document.getElementById('apply_date_button')
const noTodosMessage = document.getElementById('no_todos_message')
const chartCanvas = document.getElementById('myChart')
const chartContainer = document.querySelector('.chart-container')

let todoChart = null

function hideChart(){
    chartContainer.classList.add('hidden')
}

function renderAndUpdateChart(todolist) {
    chartContainer.classList.remove('hidden')

    const completed = todolist.filter(todo => todo.state == true).length
    const uncompleted = todolist.filter(todo => todo.state == false).length

    if (todoChart === null) {
        todoChart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: ['Completed', 'Uncompleted'],
                datasets: [{
                    label: 'Statistics',
                    data: [completed, uncompleted]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        })
    } else {
        todoChart.data.datasets[0].data = [completed, uncompleted]
        todoChart.update()
    }
}

function removeEmptyInputWarning() {
    emptyInputWarning.classList.add('hidden')
}

function renderEmptyInputWarning() {
    emptyInputWarning.classList.remove('hidden')
}

function renderEmptyTodoListWarning(){
    noTodosMessage.classList.remove('hidden')
}

function removeEmptyTodoListWarning(){
    noTodosMessage.classList.add('hidden')
}

function nullifyStatistics(){
    completedTasksValue.textContent = "-"
    uncompletedTasksValue.textContent = "-"
    totalTasksValue.textContent = "-"
}

function deletedOldTodos(){
    const allElements = Array.from(todoContainer.querySelectorAll('li'))
    console.log(allElements)
    for(let i = 0; i < allElements.length; i++){
        allElements[i].remove()
    }
}

async function addTodo() {
    const todoText = input.value.trim()
    const todoDate = datePickerInput.value
    if (!todoText){
        renderEmptyInputWarning()
        return
    }
    removeEmptyInputWarning()
    removeEmptyTodoListWarning()
    const addTodoResponse =  await fetch('/addTodo', {method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify({ todoText, todoDate })})
    const allTodos = await addTodoResponse.json()
    deletedOldTodos()
    for (let i = 0; i < allTodos.length; i++) {
        renderTodo(allTodos[i])
    }
    updateStatistics(allTodos)
    renderAndUpdateChart(allTodos)
    input.value = ''
}

document.addEventListener('DOMContentLoaded', async () => {
    try{
        updateDate()
        const allTodos = await requestAllTodos(datePickerInput.value)
        if(allTodos.length === 0){
            renderEmptyTodoListWarning()
            hideChart()
            return
        }
        renderAllTodos(allTodos)
        updateStatistics(allTodos)
        renderAndUpdateChart(allTodos)
    }catch(err){
        console.error(err)
    }
})

addButton.addEventListener('click', addTodo)

document.addEventListener('keydown', (e) => {
    if(e.key === "Enter"){
        addTodo()
    }
})

dateApplyBtn.addEventListener('click', async (e) => {
    deletedOldTodos()
    removeEmptyInputWarning()
    removeEmptyTodoListWarning()
    const date = datePickerInput.value
    const todos = await requestAllTodos(date)
    if(todos.length === 0){
        renderEmptyTodoListWarning()
        nullifyStatistics()
        hideChart()
        return
    }
    renderAllTodos(todos)
    updateStatistics(todos)
    renderAndUpdateChart(todos)
})

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
        const reponseFromServer = await fetch(`/changetodostate?date=${datePickerInput.value}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify({ request })})
        const todos = await reponseFromServer.json()


        updateStatistics(todos)
        renderAndUpdateChart(todos)
    })

    deleteBtn.addEventListener('click', (e) => {
        emptyInputWarning.classList.add('hidden')
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
            if(response.newTodoList.length === 0){
                hideChart()
                renderEmptyTodoListWarning()
                document.getElementById(response.deletedElement.id).remove()
                return
            }
            document.getElementById(response.deletedElement.id).remove()
            updateStatistics(response.newTodoList)
            renderAndUpdateChart(response.newTodoList)
        })
    })
    todoContainer.appendChild(newLi)
}


function renderAllTodos(todos) {
    if(todos.length === 0){
        renderEmptyTodoListWarning()
        nullifyStatistics()
        return
    }
    deletedOldTodos()
    for(let i = 0; i < todos.length; i++){
        renderTodo(todos[i])
    }
}