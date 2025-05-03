const chatform = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomname = document.getElementById('room-name')
const userlist = document.getElementById('users')
const { username,room } = Qs.parse(location.search,{
    ignoreQueryPrefix : true
})

const socket = io();

//join chatroom
socket.emit('joinroom',{username,room})

//get room and users
socket.on('roomUsers', ({ room,users })=>{
    outputroomname(room),
    outputusers(users)
})

socket.on('message',message=>{
    console.log(message)
    outputmessages(message)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatform.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    console.log(msg)

    //emit message to server
    socket.emit('chatMessage',msg)
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
})
function outputmessages(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`
    document.querySelector('.chat-messages').appendChild(div)
}

function outputroomname(room){
    roomname.innerText = room;
}

function outputusers(users){
    userlist.innerHTML = users.map(user=>`<li>${user.username}</li>`).join('')
}