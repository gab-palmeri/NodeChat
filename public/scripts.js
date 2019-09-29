let chatText = document.getElementById('chatText');
let chatInput = document.getElementById('chatInput');
let chatForm = document.getElementById('chatForm');
let notifications = document.getElementById('notifications');
let onlineUsers = document.getElementById('onlineUsers');

//a flag useful to detect whether the user is typing or not
let isWriting = 0;
let socketId;

let username = prompt("Please enter your name", "John Doe");
if(username == null)
    username = 'John Doe';

let socket = io();

//USER SOCKETS

//sends the username and launches the init process
socket.on('connect',function(){
    socket.emit('init', username);
});

//adds all the online users to the online users box and saves the id of the current user
socket.on('usersOnlineAndSocketId', function(data){
    socketId = data.id
    for(var i in data.users)
    {
        //if the user is the current one, dont display the "PM" button
        if(data.users[i].id != socketId)
            onlineUsers.innerHTML += `<div class="mb-2" id="online` + data.users[i].id + `">` +
                data.users[i].name + `<button onclick="sendPM(`+ data.users[i].id + `,'` + data.users[i].name +`')" class="btn btn-info btn-sm ml-2">PM</button>
            </div>`
        else
            onlineUsers.innerHTML += '<div class="mb-2" id="online' + data.users[i].id + '">' + data.users[i].name + '</div>'
    }
})

//adds a new user that has come online to the online users box
socket.on('newUserOnline', function(data){
    onlineUsers.innerHTML += `<div class="mb-2" id="online` + data.id + `">` + data.name + `<button onclick="sendPM(` + data.id + `,'` + data.name + `')" class="btn btn-info btn-sm ml-2">PM</button></div>`
})

//removes the user from the online box and, if he was writing when he disconnected, from the notification box
socket.on('anotherUserDisconnected', function(data){
    if(document.getElementById('writing' + data) != null)
        document.getElementById('writing' + data).remove();
    document.getElementById('online' + data).remove();
})

//CHAT SOCKETS

//adds another user's message to the chat
socket.on('addToChat',function(data){
    chatText.innerHTML += `<div class="incoming_msg">
        <div class="incoming_msg_img mb-3"> <img src="https://picsum.photos/200"> </div>
        <div class="received_msg">
            <div class="received_withd_msg">
                <p>` + data + `</p>
                    <span class="time_date">` + new Date().toLocaleString() + `</span>
            </div>
        </div>
    </div>`;
});

//signals another user is writing
socket.on('isWriting', function(data){
    notifications.innerHTML += '<div id="writing' + data.socketId + '">' + data.socketName + ' sta scrivendo... </div>';
})

//removes the "is writing" text for a certain user
socket.on('notWriting', function(data){
    if(document.getElementById('writing' + data))
        document.getElementById('writing' + data).remove();
})

//sends message and informs the other users that he's not writing anymore
chatForm.onsubmit = function(e){
    e.preventDefault();
    if(chatInput.value.trim() != '')
    {
        socket.emit('sendMsgToServer',chatInput.value);

        //this check is done to prevent errors if the user sent a message after being afk for more than 4 seconds
        if(isWriting == 1)
            socket.emit('notWriting');

        chatText.innerHTML += `
            <div class='outgoing_msg'>
                <div class='sent_msg'>
                    <p>` + chatInput.value + `</p>
                    <span class="time_date">` + new Date().toLocaleString() + `</span>
                </div>
            </div>`;

        chatInput.value = '';
    }
}

//sends the "is writing" text if the isWriting flag is 0, if an allowed char has been typed and if the input box is focused
document.onkeydown = function(event){
    var valid =
        (event.keyCode > 47 && event.keyCode < 58)   || // number keys
        (event.keyCode > 64 && event.keyCode < 91)   || // letter keys
        (event.keyCode > 95 && event.keyCode < 112)  || // numpad keys
        (event.keyCode > 185 && event.keyCode < 193) || // ;=,-./` (in order)
        (event.keyCode > 218 && event.keyCode < 223) ||  // [\]' (in order)
        (chatInput.value.trim().length != 0 && event.keyCode == 8) //deleting a character (8 = backspace);

    if(chatInput == document.activeElement && valid && isWriting == 0)
    {
        socket.emit('isWriting');
        isWriting = 1;
    }
}

//this part periodically checks if the user is typing or not.
//if the text stayed the same for 3.5 seconds, or if the textbox is empty, isWriting is set to 0
//the isWriting flag is useful to send the "is writing" message to other users
currentChatValue = chatInput.value
setInterval(() => {

    if(chatInput.value.trim().length == 0 || currentChatValue == chatInput.value)
    {
        if(isWriting == 1)
            socket.emit('notWriting');
        isWriting = 0
    }
    else
        isWriting = 1;


    currentChatValue = chatInput.value
}, 4000)

//this function sends a PM to a user
function sendPM(id, name)
{
    let message = prompt("Inserisci il tuo messaggio", "");
    if(message.trim().length > 0)
    {
        socket.emit("privateMessage", {id, message});
        chatText.innerHTML += `
            <div class='outgoing_msg'>
                <div class='sent_msg'>
                    <p>` + message + ` (PM a ` + name + `)</p>
                    <span class="time_date">` + new Date().toLocaleString() + `</span>
                </div>
            </div>`;

    }
}
