const express = require('express')
const path = require('path')
const crypto = require('crypto')
const db = require('./db')

const app = express()
const port = 3000

async function listAllTodos() {
        const [todos] = await db.query('SELECT * from todos')
        return todos
}


function insertTodo(req, res, todo) {
    db.query('INSERT INTO todos (todo, state, username, date) VALUES (?, ?, ?, ?)', 
        [todo.todo, todo.state, todo.username, todo.date], (err, result) => {
            if(err){
                console.log(err)
            }
        }
    )
}

app.use(express.static(path.join(__dirname, 'frontend')))

app.use(express.json())

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

app.get('/listAlltodos', async (req, res, next) => {
    try{
        const todos = await listAllTodos()
        res.send(JSON.stringify(todos))
    }catch(err){
        res.status(500).send(err.message)
    }
})

app.post('/changetodostate', (req, res, next) => {
    const newElement = req.body.request
    const indexOfTheElement = todos.findIndex((x) => {return x.id == newElement.id})
    todos[indexOfTheElement] = newElement
    res.send(JSON.stringify(todos))
})

app.post('/addTodo', (req, res,next) => {
    const body = req.body.text
    console.log(body)
    const todoObj = {
        id: crypto.randomUUID(),
        todo: body,
        state: false,
        username: "user1",
        date: new Date().toISOString().split('T')[0]
    }
    const {todo, state, username, date} = todoObj
    console.log(todo, state, username, date)
    todos.push(todoObj)
    res.send(JSON.stringify(todos))

    //SQL insert logic that will replace standart object logic

    insertTodo(req, res, todoObj)
})

app.post('/deleteTodo', (req, res, next) => {
    const body = req.body.request
    const indexOfTheElement = todos.findIndex((x) => {return x.id == body.id})
    const element = todos[indexOfTheElement]
    todos.splice(indexOfTheElement, 1)
    res.send(JSON.stringify({
        deletedElement: element,
        newTodoList: todos
    }))
})

app.listen(port, () => {
    console.log(`Server up and running on port ${port}`)
})

