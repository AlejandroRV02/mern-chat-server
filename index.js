const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socketio = require('socket.io');
const io = socketio(http);
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000',
    credential: true,
    optionSuccessStatus:200
}

const authRoutes = require('./routes/authRoutes')

const mongoDB = 'mongodb://localhost/node-chat';

mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => console.log('BD connected'))
.catch(err => console.error(err));

const Room = require('./models/Room');
const Message = require('./models/Message');

const {addUser, getUser, removeUser} = require('./helpers');


const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use(authRoutes);


io.on('connection', (socket) => {
    console.log(socket.id);
    Room.find()
        .then(result => {
            console.log(result)
            socket.emit('output-rooms', result);
        })
    socket.on('create-room', name => {
        console.log(`The room recieved is ${name}`);
        const room = new Room({name});
        room.save()
            .then(result => {
                io.emit('room-created', result)
            });
    });
    socket.on('join', ({name, user_id, room_id}) => {
        const {error, user} = addUser({socket_id:socket.id, name, user_id, room_id});
        socket.join(room_id)
        if(error){
            console.log(error)
        }else{
            console.log(user)
        }
    })

    socket.on('send-message',(message, room_id, callback)=>{
        const user = getUser(socket.id);
        const messageToStore = {
            name : user.name,
            user_id : user.user_id,
            room_id,
            text : message
        };
        console.log(messageToStore)
        const msg = new Message(messageToStore);
        msg.save().then(result => {
            io.to(room_id).emit('message', result)
            callback();
        })
    })

    socket.on('get-messages-history', room_id => {
        Message.find({ room_id }).then(result => {
            socket.emit('output-messages', result)
        })
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
    })
})

http.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});