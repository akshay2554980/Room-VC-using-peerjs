 
const socket=io('/');
const videoGrid=document.getElementById('video-grid')
//You are a new peer .. id is auto defined by lib so given undefined
// give host and peejs port number...
const myPeer=new Peer(undefined,{
    host:'/',
    port:'3001'
})
const myVideo=document.createElement('video');
const peers={}
let myVideoStream;
//reciving calls.
navigator.mediaDevices.getUserMedia({
    video:true,audio:true
}).then(stream=>{
    myVideoStream=stream;
    addVideoStream(myVideo,stream)
    //adding own video stream to tab.

    myPeer.on('call',call=>{
    call.answer(stream);   //reply by your stream. *fist answer the call*
    const video=document.createElement('video');

    call.on('stream',(userVideoStream)=>{    // to get callers video use 'stream' event
        addVideoStream(video,userVideoStream);
    })
  })

    socket.on('user-connected',(userId)=>{
    console.log("new user entered :", userId); // now from this user i need to send and revice streams.
    connectToNewUser(userId,stream);  // send our own stream to the new user.
    socket.on('newMessage',message=>{
        $('ul').append(`<li class="message" <b>${userId} : </b>${message}</li>`)
        scrollMsg();
    })
  })  
})


socket.on('user-disconnected',userId=>{
        if(peers[userId])
        peers[userId].close()  //remove that peer from the array of peers.
})
myPeer.on('open',id=>{                  //'open'Emitted when a connection to the PeerServer is established
    socket.emit('join-room',roomId,id);    
})
// simply adding src and appending it to grid.
function addVideoStream(video,stream)
{
    video.srcObject=stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video);
}

// make calls when new user connects to our room.
function connectToNewUser(userId,stream)  //new user id and our videostream
{
    const call=myPeer.call(userId,stream)  //call user and send stream
    const video=document.createElement('video')
    call.on('stream',userVideoStream=>{     // got his stream and add to our tab
            addVideoStream(video,userVideoStream);
    })
    call.on('close',()=>{
        video.remove();
    })
    peers[userId]=call   
}


// 'call' event => Emitted when a remote peer attempts to call you.
// The emitted mediaConnection is not yet active; 
// you must first answer the call (mediaConnection.answer([stream]);). 
// Then, you can listen for the stream event.


//now taking the message form the input box..
//no enter button so listening to keystoke of enter using jquery
let text=$('input')
$('html').keydown((e)=>{
    if(e.which==13 && text.val().length!=0){
        socket.emit('message',text.val());
        text.val('');

    }
})

//every time scrolling to the bottom when a new message in printed..by funcall
const scrollMsg=()=>{
    let d=$('.chatWindow');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute =()=>{
 const enabled=myVideoStream.getAudioTracks()[0].enabled;
 if(enabled){
     muteAudio();
    myVideoStream.getAudioTracks()[0].enabled=false;
 }
 else{
     unmuteAudio();
    myVideoStream.getAudioTracks()[0].enabled=true;
 }
}

const unmuteAudio=()=>{
    const newIcon=`<i class="fas fa-microphone "></i> <span>Mute</span>`
    document.querySelector('.muteButton').innerHTML=newIcon;
}

const muteAudio=()=>{
    const newIcon=`<i class="fas fa-microphone-slash color"></i> <span>Unmute</span>`
    document.querySelector('.muteButton').innerHTML=newIcon;
}

const playstop =()=>{
    const enabled=myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        stopVideo();
       myVideoStream.getVideoTracks()[0].enabled=false;
    }
    else{
        playVideo();
       myVideoStream.getVideoTracks()[0].enabled=true;
    }
   }

   
const stopVideo=()=>{
    const newIcon=`<i class="fas fa-video-slash color"></i> <span>Play Video</span>`
    document.querySelector('.videoButton').innerHTML=newIcon;
}

const playVideo=()=>{
    const newIcon=`<i class="fas fa-video"></i> <span>Stop Video</span>`
    document.querySelector('.videoButton').innerHTML=newIcon;
}










