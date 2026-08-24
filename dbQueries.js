const listAllTodosByDate = 'SELECT * from todos WHERE date = ? and deleted = false'
const insertTodo = 'INSERT INTO todos (todo, state, userId, date) VALUES (?, ?, ?, ?)'
const createUser = 'INSERT INTO users (email, password) VALUES (?, ?)'
const changeTodoStateById = 'UPDATE todos SET state = ? WHERE id = ?'
const deleteTodoById = 'UPDATE todos SET deleted = TRUE WHERE id = ?;'
const selectTodoById = 'SELECT * FROM todos WHERE id = ?'
const findUserByEmail = 'SELECT * FROM users WHERE email = ?'

module.exports = {
    listAllTodosByDate,
    insertTodo,
    createUser,
    changeTodoStateById,
    deleteTodoById,
    selectTodoById,
    findUserByEmail
}