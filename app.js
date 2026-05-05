const express = require('express')
const path = require('path')

const app = express()
const port = 3000

const todos = [{id: 1, todo: "Todo number 1", ready: false}] // For test purposes waiting for DB

app.use(express.static(path.join(__dirname, 'frontend')))

app.use(express.json())

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

app.get('/listAlltodos', (req, res, next) => {
    res.send(JSON.stringify(todos))
})

app.post('/changetodostate', (req, res, next) => {
    console.log(req.body)
})

app.post('/addTodo', (req, res,next) => {
    const body = req.body.text
    const todoObj = {
        id: Math.floor(Math.random()*100),
        todo: body,
        ready: false
    }
    todos.push(todoObj)
    res.send(JSON.stringify(todos))
})

app.listen(port, () => {
    console.log(`Server up and running on port ${port}`)
})

