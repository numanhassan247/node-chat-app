const socket = io()


const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $shareLocationButton = document.querySelector("#share-location")
const $chatbox = document.querySelector("#chatbox")

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
let temp = undefined

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $chatbox.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $chatbox.offsetHeight

    // Height of messages container
    const containerHeight = $chatbox.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $chatbox.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $chatbox.scrollTop = $chatbox.scrollHeight
    }
}

socket.on('showMessage', (message) => {
    console.log(message)

    const rendered = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    temp = document.createElement('div');
    temp.innerHTML = rendered
    $chatbox.insertAdjacentElement('beforeend', temp)

    autoscroll()
})

socket.on('locationMessage', (data) => {

    const rendered = Mustache.render(locationTemplate, {
        username: data.username,
        url: data.url,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    temp = document.createElement('div');
    temp.innerHTML = rendered
    $chatbox.insertAdjacentElement('beforeend', temp)

    autoscroll()
})

socket.on('roomData', ({ room, users }) => {

    const rendered = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    // temp = document.createElement('div');
    document.querySelector("#sidebar").innerHTML = rendered
})


$messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = e.target.elements.message.value

    $messageFormButton.setAttribute('disabled', 'disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    socket.emit('sendMessage', message, (msg) => {
        console.log('the message was delevered', msg)
        $messageFormButton.removeAttribute('disabled')
    })
})



document.querySelector("#share-location").addEventListener('click', e => {


    if (!navigator.geolocation) {
        return alert('Your browser sucks, geolocation not supported')
    }

    $shareLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position,) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        socket.emit('shareLocation', { latitude, longitude }, () => {
            $shareLocationButton.removeAttribute('disabled')
            console.log('location shared !')
        })
    }, (error) => {
        const latitude = '31.47039'
        const longitude = '74.29489'

        socket.emit('shareLocation', { latitude, longitude }, () => {
            $shareLocationButton.removeAttribute('disabled')
            console.log('Error: Default location shared !')
        })

    })

})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})