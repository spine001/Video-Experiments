// index.js
'use strict';

// Loading dependencies & initializing express
const os = require('os') // for operating system-related utility methods and properties
const express = require('express')
const http = require('http') // for creating http server
const path = require('path')
const morgan = require('morgan')


// For signalling in WebRTC
const socketIO = require('socket.io')

const app = express()

// log httpactivity 
app.use(morgan('dev'))

// Define the folder which contains the CSS and JS for the frontend
// Configure app. express.static will also serve the favicon.ico file located in /public, thanks to a link placed in the html

app.use('/public', express.static(path.resolve(__dirname, 'public')))

//Define a route 
app.get("/", function (req, res) {
	// Render a view (located in the directory views/) on this route
	res.render("index.ejs")
});

// For http:
// Initialize http server and associate it with express
const server = http.createServer(app)

// Ports on which server should listen - 5000 or the one provided by the environment
server.listen(process.env.PORT || 5000)

// Initialize socket.io for http
const io = socketIO(server)


// Implementing Socket.io
// connection is a synonym of reserved event connect
// connection event is fired as soon as a client connects to this socket.
io.on('connection', socket => {

	// Convenience function to log server messages on the client.
	// Arguments is an array like object which contains all the arguments of log(). 
	// To push all the arguments of log() in array, we have to use apply().
	function log() {
		var array = ['Message from server:'];
		array.push.apply(array, arguments);
		console.log(arguments)
		socket.emit('log', array);
	}


	//Defining Server behavious on Socket Events
	socket.on('message', (message, room) => {
		log('Client said: ', message);
		//server should send the receive only in room
		socket.in(room).emit('message', message, room);
	});

	//Event for joining/creating room
	socket.on('create or join', room => {
		log('Received request to create or join room ' + room)

		//Finding clients in the current room
		let clientsInRoom = 0; // Init to 0, so if the room doesn't exist yet, we'll count as zero clients, since nobody has created the room yet
		if (io.sockets.adapter.rooms.has(room))  clientsInRoom = io.sockets.adapter.rooms.get(room).size
		let numClients = clientsInRoom
		
		log('Room ' + room + ' now has ' + numClients + ' client(s)')

		//If no client is in the room, create a room and add the current client
		if (numClients === 0) {
			socket.join(room)
			log('Client ID ' + socket.id + ' created room ' + room)
			socket.emit('created', room, socket.id)
		}

		//If one client is already in the room, add this client in the room
		else if (numClients === 1) {
			log('Client ID ' + socket.id + ' joined room ' + room)
			io.sockets.in(room).emit('join', room)
			socket.join(room)
			socket.emit('joined', room, socket.id)
			io.sockets.in(room).emit('ready')
		}

		//If two clients are already present in the room, do not add the current client in the room
		else { // max two clients
			socket.emit('full', room)
		}
	})

	//Utility event 
	socket.on('ipaddr', () => {
		var ifaces = os.networkInterfaces()
		for (var dev in ifaces) {
			ifaces[dev].forEach(function (details) {
				if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
					socket.emit('ipaddr', details.address);
				}
			})
		}
	})

	//Event for notifying other clients when a client leaves the room
	socket.on('bye', () => {
		console.log('received bye')
	})

	// Handle disconnect events
	socket.on("disconnect", reason => {
		console.log(`disconnect reason: ${reason}`)
	})

	// Handle an error
	socket.on("error", (err) => {
		if (err && err.message === "unauthorized event") {
			socket.disconnect()
		}
		console.log('unauthorized event triggered disconnect')
	})

	// Handle user leaving
	socket.on("disconnecting", (reason) => {
		for (const room of socket.rooms) {
			if (room !== socket.id) {
				socket.to(room).emit("user has left", socket.id)
			}
		}
	})
})