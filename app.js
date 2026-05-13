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

async function insertTodo(todo) {
    const reponse = db.query('INSERT INTO todos (todo, state, username, date) VALUES (?, ?, ?, ?)', 
        [todo.todo, todo.state, todo.username, todo.date])
    return reponse
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

app.post('/addTodo', async (req, res,next) => {
    const body = req.body.text
    const todoObj = {
        todo: body,
        state: false,
        username: "user1",
        date: new Date().toISOString().split('T')[0]
    }
    try{
        const response = await insertTodo(todoObj)
        const allTodos = await listAllTodos()
        res.send(JSON.stringify(allTodos))

    }catch(err){
        res.send(err.message)
    }
})

app.post('/deleteTodo', async (req, res, next) => {
    const deletedElementId = req.body.request.id
    const [[deletedElement]] = await db.query('SELECT * FROM todos WHERE id = ?', [deletedElementId])
    const reponseFromDb = await db.query('DELETE FROM todos WHERE id = ?', [deletedElementId])
    const newTodoList = await listAllTodos()
    res.send(JSON.stringify({
        deletedElement,
        newTodoList
    }))
})

app.listen(port, () => {
    console.log(`Server up and running on port ${port}`)
})

