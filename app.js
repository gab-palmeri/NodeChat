var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.use('/',express.static(__dirname + '/public'));

serv.listen(2000);
console.log("Server listening on port 2000");

var SOCKET_LIST = {};

var io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    //USER SOCKETS

    //the init function
    socket.on('init', function(data){
        //sets username
        SOCKET_LIST[socket.id].name = data;

        //returns online users
        let users = [];
        for(var i in SOCKET_LIST)
        {
            users.push({
                name: SOCKET_LIST[i].name,
                id: SOCKET_LIST[i].id
            });
            //while taking all the online users, the current user signals to the others that he is online
            if(SOCKET_LIST[i] != socket)
                SOCKET_LIST[i].emit('newUserOnline', {
                    name: SOCKET_LIST[socket.id].name,
                    id: SOCKET_LIST[socket.id].id
                })
        }

        //sends the socket ID to decide wheter to display the "PM" button or not
        socket.emit('usersOnlineAndSocketId', {
            users: users,
            id: socket.id
        });

    })

    //removes the socket from the socket list and signals the disconnection to the other users
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];

        for(var i in SOCKET_LIST)
            SOCKET_LIST[i].emit('anotherUserDisconnected', socket.id);

    });

    //CHAT SOCKETS

    socket.on('sendMsgToServer',function(data){
        for(var i in SOCKET_LIST){
            if(SOCKET_LIST[i] != socket)
                SOCKET_LIST[i].emit('addToChat',socket.name + ': ' + data);
        }
    });

    socket.on('privateMessage', function(data){
        SOCKET_LIST[data.id].emit('addToChat', 'PM da ' + socket.name + ': ' + data.message);
    });

    socket.on('isWriting', function(){
        for(var i in SOCKET_LIST){
            if(SOCKET_LIST[i].id != socket.id)
                SOCKET_LIST[i].emit('isWriting', {
                    socketName: socket.name,
                    socketId: socket.id
                });
        }
    })
    socket.on('notWriting', function(){
        for(var i in SOCKET_LIST){
            if(SOCKET_LIST[i].id != socket.id)
                SOCKET_LIST[i].emit('notWriting', socket.id);
        }
    })



});
