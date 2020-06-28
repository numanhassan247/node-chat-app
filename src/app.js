require('dotenv').config()
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const message = require('./utils/message')
const users = require('./utils/users')


const app = express()
const server = http.Server(app);
const io = socketio(server);


const port = process.env.PORT

// Public Directory setting
const PUBLIC_PATH = path.join(__dirname, '../public')
app.use(express.static(PUBLIC_PATH))

const welcomeMsg = 'Welcome!'
const newUserMsg = 'New User has joined !'
const userLeftMsg = 'User Left!'
io.on('connection', (socket) => {
    // console.log('new Socket IO connection');
    // socket.emit('showMessage', message.generateMessage(welcomeMsg))
    // socket.broadcast.emit('showMessage', message.generateMessage(newUserMsg))

    socket.on('join', (options, callback) => {

        const { error, user } = users.addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('showMessage', message.generateMessage(user.username, welcomeMsg))
        socket.broadcast.to(user.room).emit('showMessage', message.generateMessage('Admin', `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: users.getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (text, callback) => {
        const user = users.getUser(socket.id)
        if (text === 'shit') {
            return callback('You can\'t say shit')
        }
        io.to(user.room).emit('showMessage', message.generateMessage(user.username, text))

        callback()
    })

    socket.on('shareLocation', (coords, callback) => {
        const user = users.getUser(socket.id)
        io.to(user.room).emit('locationMessage', message.localtionMessage(user.username, coords))
        callback()
    })

    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('showMessage', message.generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: users.getUsersInRoom(user.room)
            })
        }
    })

})



server.listen(port, () => console.log('Server Started at port ', port))