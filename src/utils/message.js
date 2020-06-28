
exports.generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

exports.localtionMessage = (username, coords) => {
    const url = `https://www.openstreetmap.org/#map=18/${coords.latitude}/${coords.longitude}`
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}