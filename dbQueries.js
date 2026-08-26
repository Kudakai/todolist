const listAllTodosByDateAndUser = 'SELECT * from todos WHERE date = ? and deleted = false and userId = ?'
const insertTodo = 'INSERT INTO todos (todo, state, userId, date) VALUES (?, ?, ?, ?)'
const createUser = 'INSERT INTO users (email, password) VALUES (?, ?)'
const changeTodoStateById = 'UPDATE todos SET state = ? WHERE id = ?'
const deleteTodoById = 'UPDATE todos SET deleted = TRUE WHERE id = ?;'
const selectTodoById = 'SELECT * FROM todos WHERE id = ?'
const findUserByEmail = 'SELECT * FROM users WHERE email = ?'

module.exports = {
    listAllTodosByDateAndUser,
    insertTodo,
    createUser,
    changeTodoStateById,
    deleteTodoById,
    selectTodoById,
    findUserByEmail
}