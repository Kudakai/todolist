const express = require('express')
const path = require('path')

const app = express()
const port = 3000

const todos = [] // For test purposes waiting for DB

app.use(express.static(path.join(__dirname, 'frontend')))

app.use(express.json())

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

app.get('/listAlltodos', (req, res, ne) => {
    res.send(JSON.stringify(todos))
})

app.post('/changetodostate', (req, res, next) => {
    const newElement = req.body.request
    const indexOfTheElement = todos.findIndex((x) => {return x.id == newElement.id})
    todos[indexOfTheElement] = newElement
    res.send("200 OK")
})

app.post('/addTodo', (req, res,next) => {
    const body = req.body.text
    const todoObj = {
        id: Math.floor(Math.random()*100),
        todo: body,
        state: false
    }
    todos.push(todoObj)
    res.send(JSON.stringify(todos))
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

