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

app.get('/listAlltodos', (req, res, next) => {
    console.log("This is after git push")
    res.send(JSON.stringify(todos))
})

app.post('/addTodo', (req, res,next) => {
    const body = req.body.text
    todos.push(body)
    res.send(JSON.stringify(todos))
})

app.listen(port, () => {
    console.log(`Server up and running on port ${port}`)
})

