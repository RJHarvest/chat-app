const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const ejs = require('ejs')
const path = require('path')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html')
})

let usernames = []

io.on('connection', (socket) => {
  console.log(`New connection with socket id: ${socket.id}`)
  socket.broadcast.emit('user-connection', socket.id)

  socket.on('message', (message) => {
    console.log('message', message)
    socket.broadcast.emit('message', message)
  })
  socket.on('disconnect', () => {
    io.emit('user-disconnect', socket.id)
  })
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("user has left", socket.id);
      }
    }
  })
})

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
