const express = require('express')
const path = require('path')
const crypto = require('crypto')
const dbQueries = require('./dbQueries')
const db = require('./db')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

const app = express()

const port = 3000
const tokensMaxAgeSeconds = 10 * 24 * 60 * 60
const tokensMaxAgeMilliSeconds = 10 * 24 * 60 * 60

function isValidEmail(email){
    const checkResult = email?.includes('@') && email?.split('@')[1]?.includes('.')
    return checkResult
}

function isValidPassword(password){
    const checkResult = password?.length >= 7
    return checkResult
}

async function listAllTodos(date) {
    const [todos] = await db.query(dbQueries.listAllTodosByDate, [date])
    return todos
}

async function insertTodo(todo) {
    const reponse = db.query(dbQueries.insertTodo, 
        [todo.todo, todo.state, todo.userId, todo.date])
    return reponse
}

async function changeTodoState(newState, id){
    const response = db.query(dbQueries.changeTodoStateById, [newState, id])
}

async function createUser(email, password) {
        const response = await db.query(dbQueries.createUser, 
        [email, password])
        return response
}

function createToken(id, email){
    return jwt.sign({id, email}, 'Secret key', {expiresIn: tokensMaxAgeSeconds})
}

app.use(express.static(path.join(__dirname, 'frontend')))

app.use(express.json())

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'))  
})

app.post('/login', async (req, res, next) => {
    try{
        const {email, password} = req.body
        if(!isValidEmail(email)){
            const err = {message: "Wrong email format", id: 1}
            throw err
        }

        const user = await db.query(dbQueries.findUserByEmail, [email])
        if(user[0].length === 0){
            const err = {message: "No user with this email", id: 2}
            throw err
        }
        const isPasswordValid = await bcrypt.compare(password, user[0][0].password)
        if(!isPasswordValid){
            const err = {message: "Wrong password", id: 3}
            throw err
        }
        res.status(200).json({message: "Suggessfully logged in", email, id: user[0][0].id})
    } catch(err){
        console.log(err)
        res.status(400).json({error:err})

    }
})

app.get('/signup', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'signup.html'))
})

app.post('/signup', async (req, res, next) => {
    const {email, password} = req.body
        try{
            if(!isValidEmail(email)){
                const err = {message: 'Entered Email is not valid. Email should contain "@" symbol and email domain after "."', errorId: 1}
                throw err
            }
            if(!isValidPassword(password)){
                const err = {message: 'Password should be at least 7 symbols', errorId: 2}
                throw err
            }
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(password, salt)
            const response = await createUser(email, hashedPassword)
            const userId = response[0].insertId
            const token = createToken(userId, email)
            res.cookie('jwt', token, {httpOnly: true, maxAge: tokensMaxAgeMilliSeconds})
            res.status(201).json({userId: userId})

        } catch(err) {
            if(err.errno === 1062){
                err = {message: 'Entered email is already in use',errorId: 3}
            }
            res.status(400).send(err)
        }
})

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

app.get('/listAlltodos', async (req, res, next) => {
    const date = req.query.date
    try{
        const response = await listAllTodos(date)
        res.send(JSON.stringify(response))
    }catch(err){
        res.status(500).send(err.message)
    }
})

app.post('/changetodostate', async (req, res, next) => {
    const date = req.query.date
    const changedObj = req.body.request
    const newState = changedObj.state
    try{
        const reponseFromDb = changeTodoState(changedObj, newState)
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
    const response = await db.query(dbQueries.deleteTodoById, [deletedElementId])
    const newTodoList = await listAllTodos(currentDate)
    res.status(200).send(JSON.stringify({
        deletedElement,
        newTodoList
    }))
})

app.listen(port, '0.0.0.0', () => {
    console.log(`App up and running on port ${port}`)
})