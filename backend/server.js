import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';
import cors from "cors"
const app = express();
const server = createServer(app);
const io = new Server(server , {cors:{
  origin:"*"
}})
app.use(cors({
  origin:"*"
}))

const ROOM  = "group"
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('joinRoom', async (userName) => {
    console.log(`${userName} joining room: ${ROOM}`);
    await socket.join(ROOM); // join method too connect user to the room return promise
    // Emit the actual string 'userName' to others in the room
    // socket.to(ROOM) sends to everyone EXCEPT the sender

    socket.to(ROOM).emit('oneJoin', userName); 
  });


  socket.on('chatMessage' , (message)=>{
    console.log(`${message.text}`)

    socket.to(ROOM).emit('chatMessage' , message)
  })

  socket.on("typing", (userName)=>{
    console.log(`${userName} is typing..` )
    socket.to(ROOM).emit("typing",userName)

  } )


  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});



app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});



server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});