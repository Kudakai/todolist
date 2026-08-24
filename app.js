const express = require('express')
const path = require('path')
const crypto = require('crypto')
const dbQueries = require('./dbQueries')
const db = require('./db')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const app = express()

const tokensMaxAgeSeconds = 10 * 24 * 60 * 60
const tokensMaxAgeMilliSeconds = 10 * 24 * 60 * 60
const port = 3000

async function listAllTodos(date) {
    const [todos] = await db.query(dbQueries.listAllTodosByDate, [date])
    return todos
}

async function insertTodo(todo) {
    const reponse = db.query(dbQueries.insertTodo, 
        [todo.todo, todo.state, todo.userId, todo.date])
    return reponse
}

async function createUser(email, password) {
        const reponse = await db.query(dbQueries.createUser, 
        [email, password])
    return { id: reponse[0].insertId,
             email: email}
}

function createToken(id){
    return jwt.sign({id}, 'Secret key', {expiresIn: tokensMaxAgeSeconds})
}

app.use(express.static(path.join(__dirname, 'frontend')))

app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'))
    
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
    if(email.includes('@') && password.length >= 7){
        try{
            const user = await createUser(email, hashedPassword)
            const userId = user.id
            const token = createToken(userId)
            res.cookie('jwt', token, {httpOnly: true, maxAge: tokensMaxAgeMilliSeconds})
            res.status(201).json({user: userId})
   }
        catch(err) {
            if(err.errno === 1062){
                res.status(400).send({message: "User with this email is already exists", errorNumber: err.errno})
                return
            }
        res.status(400).send({message: "User has not been created", errNo: err.errno})
        console.log(err)
   }
    } else if (!email.includes('@')) {
        res.status(400).send({message: "Not a proper email adress", errNo: 1})
    } else if (password.length < 7){
        res.status(400).send({message: "Password should be at least 7 symbols", errNo: 2})
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
        const reponseFromDb = await db.query(dbQueries.changeTodoStateById, [newState, changedObj.id])
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
    const [[deletedElement]] = await db.query(dbQueries.selectTodoById, [deletedElementId])
    const reponseFromDb = await db.query(dbQueries.deleteTodoById, [deletedElementId])
    const newTodoList = await listAllTodos(currentDate)
    res.send(JSON.stringify({
        deletedElement,
        newTodoList
    }))
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server up and running on port ${port}`)
})