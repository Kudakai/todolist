const express = require('express')
const path = require('path')
const crypto = require('crypto')
const db = require('./db')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')


const app = express()
const port = 3000

async function listAllTodos(date) {
    const [todos] = await db.query('SELECT * from todos WHERE date = ? and deleted = false', [date])
    return todos
}

async function insertTodo(todo) {
    const reponse = db.query('INSERT INTO todos (todo, state, userId, date) VALUES (?, ?, ?, ?)', 
        [todo.todo, todo.state, todo.userId, todo.date])
    return reponse
}

async function createUser(email, password) {
        const reponse = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', 
        [email, password])
    return { id: reponse[0].insertId,
             email: email}
}

app.use(express.static(path.join(__dirname, 'frontend')))

app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'))
    
})

app.get('/set-cookies', (req, res, next) => {
    res.cookie('newUser', true)
    res.cookie('isEmpoyee', false, {maxAge: 1000*60*60*24})
    res.send("Cookie has been written")
})

app.post('/login', (req, res, next) => {
    res.send("New login")
    const {email, password} = req.body
    console.log(email, password)
})

app.get('/signup', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'signup.html'))
})

app.post('/signup', async (req, res, next) => {
    const {email, password} = req.body
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
   try{
    const user = await createUser(email, hashedPassword)
    res.status(201).json({status: "User has been created", 
                          user: {
                            id:user.id,
                            email: user.email
                          }})
   }
   catch(err) {
    res.status(400).send("error, user is not created")
   }
})

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

app.get('/listAlltodos', async (req, res, next) => {
    const date = req.query.date
    try{
        const todos = await listAllTodos(date)
        res.send(JSON.stringify(todos))
    }catch(err){
        res.status(500).send(err.message)
    }
})

app.post('/changetodostate', async (req, res, next) => {
    const date = req.query.date
    const changedObj = req.body.request
    const newState = changedObj.state
    try{
        const reponseFromDb = await db.query('UPDATE todos SET state = ? WHERE id = ?', [newState, changedObj.id])
        const newTodoList = await listAllTodos(date)
        res.send(JSON.stringify(newTodoList))

    }catch(err){
        res.status(500).send(err.message)
        console.log(err.message)
    }
    
})

app.post('/addTodo', async (req, res,next) => {
    const body = req.body
    const todoObj = {
        todo: body.todoText,
        state: false,
        userId: "123",
        date: body.todoDate
    }
    try{
        const response = await insertTodo(todoObj)
        const allTodos = await listAllTodos(body.todoDate)
        res.send(JSON.stringify(allTodos))
    }catch(err){
        res.send(err.message)
        console.log(err.message)
    }
})

app.post('/deleteTodo', async (req, res, next) => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const deletedElementId = req.body.request.id
    const [[deletedElement]] = await db.query('SELECT * FROM todos WHERE id = ?', [deletedElementId])
    const reponseFromDb = await db.query('UPDATE todos SET deleted = TRUE WHERE id = ?;', [deletedElementId])
    const newTodoList = await listAllTodos(currentDate)
    res.send(JSON.stringify({
        deletedElement,
        newTodoList
    }))
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server up and running on port ${port}`)
})