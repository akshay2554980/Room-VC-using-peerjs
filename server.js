const  express=require('express')
const app=express();
const server = require('http').Server(app)
//server which is  used with socket io. and for that u need express server
const io=require('socket.io')(server);
const {v4:uuidv4}=require('uuid')
app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`)
})
app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room})
})

io.on('connection',(socket)=>{
    socket.on('join-room',(roomId,userId)=>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected',userId);
    
        socket.on('disconnect',()=>{
            socket.to(roomId).emit('user-disconnected',userId)
        }) 
        socket.on('message',message=>{
            io.to(roomId).emit('newMessage',message);
        })
    })
})

server.listen(3000,()=>{
    console.log("server is active on port 3000");
});




// only for connection to room 
// we use http server once u get to the room
// send and reciving is done by peerjs server .Server
// http is a tcp protocol
//we can even close the server and let all the media run on 
// peerjs server.