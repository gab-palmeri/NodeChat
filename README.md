
# Project description

## Initial phase and online user view

The Socket.io library was used as the main communication tool between users, while Express was used for the creation of the server. Access to files from the browser is limited, via Express, to the "public" folder containing the index.html, scripts.js and style.css files, to prevent users from viewing private files such as "package.json" or "app.js"

The chat works like this:
  
  1. A user enters his name and logs in
  2. The server adds the user to the list of online sockets, assigning them a unique ID. An array of online sockets is used to facilitate their manipulation    

**(Custom ids are used instead of socket.io default ones to have more control over their structure)**

  3. Once the connection is established, the client sends the user username to the server via the "init" socket
  4. The server stores the name of the user and sends him the list of online users and the ID assigned to him
  5. Online users are also notified of the access of this new user

After this initialization phase, users can send messages (even private ones).

## "Is writing.." check

A client-side flag, called isWriting, checks whether the user is writing or not. The check is performed every 4 seconds and consists in comparing the value that was in the inputbox 4 seconds before the check, and the actual one: if they are the same, it means that the user has not written for 4 seconds and therefore the flag is set to 0, notifying other users via socket. The same behavior will occur if the input box is empty.

Furthermore, when a key is pressed, three checks are performed:
  1. Is the pressed key a "printable" char? (So not F1, F2, etc. for example)
  2. Does the input box have the focus?
  3. Is the writing flag at 0?

If these three conditions are met, users are warned that they are writing a message. It is checked if the input box has the focus to avoid warning users unnecessarily: the user could in fact have pressed an empty key, without having actually written anything in the input box. Finally, it checks if the isWriting flag is equal to 0. If it is 1, it means that the user was already writing before the check: therefore it is not necessary to send the alert to the other users again.

## Sending messages

If a user sends a public message, the isWriting flag is set to 0 and users are notified of this (because the user has obviously finished writing). Furthermore, the message is sent to the server via the "sendMsgToServer" socket. The server, once it has received the message, will carry out an iteration on the list of online sockets, sending the message to everyone of them through the "emit" method.

If a user sends a private message, instead, the recipient id and the message are sent to the server. The server will look for the id in the list of online sockets and send the message to the recipient.

## Graphic aspect

For the graphic interface a Bootstrap layout was used, suitably modified to adapt it to the project.

## Starting the site

To start the site run the ‘node app.js’ command and go to the localhost:2000 page.


