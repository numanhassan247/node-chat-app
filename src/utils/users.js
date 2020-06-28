const users = []

exports.addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    const existingUser = users.find(user => {
        return user.username === username && user.room === room
    })

    if (existingUser) {
        return {
            error: 'user is in use!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

exports.removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if (index >= 0) {
        return users.splice(index, 1)[0]
    }
}

exports.getUser = (id) => {
    return users.find(user => user.id === id)
}

exports.getUsersInRoom = room => {
    return users.filter(user => user.room === room)
}

