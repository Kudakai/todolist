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

async function listAllTodos(date, user) {
    const [todos] = await db.query(dbQueries.listAllTodosByDateAndUser, [date, user])
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

function requireAndCheckAuth(req, res, next){
    const token = req.cookies.jwt
    console.log(token)
    if(!token){
        if(req.path === '/login' || req.path === '/signup'){
            return next()
        }
        return res.redirect('/login')
    }

    try{
        const decoded = jwt.verify(token, "Secret key")
        req.user = decoded
        if(req.path === '/login' || req.path === '/signup'){
            return res.redirect('/')
        }
        next()
    } catch(err){
        if(req.path === '/listAlltodos' || req.path === 'changetodostate' || req.path === 'deleteTodo' || req.path === '/addTodo'){
            return res.redirect('/login') 
        }
        if (req.path === '/login' || req.path === '/signup') {
            return next()
        }
        return res.redirect('/login') 
    }
}

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {

    if (req.cookies.jwt) {
        const userInfo = jwt.decode(req.cookies.jwt)

        req.user = userInfo
    }

    next()
})

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html')) 
})

app.get('/signup', requireAndCheckAuth, (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'signup.html'))
})

app.get('/', requireAndCheckAuth, (req, res, next) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'))
    console.log(req.user)
})

app.post('/login', async (req, res, next) => {
    try{
        const {email, password} = req.body
        console.log(email,password)
        if(!isValidEmail(email)){
            const err = {message: "Wrong email format", errorId: 1}
            throw err
        }

        const user = await db.query(dbQueries.findUserByEmail, [email])
        console.log(user)
        const userId = user[0][0]?.id
        if(user[0].length === 0){
            const err = {message: "No user with this email", errorId: 2}
            throw err
        }
        const isPasswordValid = await bcrypt.compare(password, user[0][0].password)
        if(!isPasswordValid){
            const err = {message: "Wrong password", errorId: 3}
            throw err
        }
        const token = createToken(userId, email)
        res.cookie('jwt', token, {httpOnly: true, maxAge: tokensMaxAgeMilliSeconds})
        res.status(200).json({message: "Suggessfully logged in", email, userId})
    } catch(err){
        console.log(err)
        res.status(400).json({err})

    }
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



app.get('/listAlltodos', requireAndCheckAuth, async (req, res, next) => {
    const date = req.query.date
    const user = req.user.id
    try{
        const response = await listAllTodos(date, user)
        res.send(JSON.stringify(response))
    }catch(err){
        res.status(500).send(err.message)
    }
})

app.post('/changetodostate', requireAndCheckAuth, async (req, res, next) => {
    const date = req.query.date
    const changedObj = req.body.request
    const newState = changedObj.state
    const user = req.user.id
    try{
        const reponseFromDb = changeTodoState(changedObj, newState)
        const newTodoList = await listAllTodos(date, user)
        res.send(JSON.stringify(newTodoList))

    }catch(err){
        res.status(500).send(err.message)
        console.log(err.message)
    }
    
})

app.post('/addTodo', requireAndCheckAuth, async (req, res,next) => {
    const body = req.body
    const userId = req.user.id
    const todoObj = {
        todo: body.todoText,
        state: false,
        userId: userId,
        date: body.todoDate
    }
    const user = req.user.id
    try{
        const response = await insertTodo(todoObj)
        const allTodos = await listAllTodos(body.todoDate, user)
        res.send(JSON.stringify(allTodos))
    }catch(err){
        res.send(err.message)
        console.log(err.message)
    }
})

app.post('/deleteTodo', requireAndCheckAuth, async (req, res, next) => {
    const now = new Date()
    const user = req.user.id
    const currentDate = now.toISOString().split('T')[0]
    const deletedElementId = req.body.request.id
    const [[deletedElement]] = await db.query(dbQueries.selectTodoById, [deletedElementId])
    const response = await db.query(dbQueries.deleteTodoById, [deletedElementId])
    const newTodoList = await listAllTodos(currentDate, user)
    res.status(200).send(JSON.stringify({
        deletedElement,
        newTodoList
    }))
})

app.get('/logout', async (req, res, next) => {
    console.log("logout endpoint has been touched")
    res.clearCookie('jwt')
    res.redirect('/login')
})

app.use(express.static(path.join(__dirname, 'frontend')))

app.listen(port, '0.0.0.0', () => {
    console.log(`App up and running on port ${port}`)
})