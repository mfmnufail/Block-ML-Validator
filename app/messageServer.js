// const ws = require("ws")
const http = require('http')
const express = require('express');
const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io')

const io = new Server(server) 
const { path } = require('path');

// const wss  = require('ws') ;
// const { WebSocketServer }  = require('ws') ;
const PORT = process.env.PORT || 3000

// const server = new wss.Server({ 
//     port : 8080
// });

const MY_ADDRESS = `http://localhost:3000`
const peers = []
let opened = []
let connected = []
let check = []
let checking = []


io.on("connection", (socket)=>{
    socket.on("message", message =>{
        const _message = JSON.parse(message);
        console.log(_message)

        switch(_message.type){
            case "TYPE_HANDSHAKE":
                const nodes = _message.data;
                nodes.foreach(node => connect(node));
        }
    })

})


// server.on("connection", async (socket, req) => {

//         socket.on("message", message =>{
//             const _message = JSON.parse(message);
//             console.log(_message)

//             switch(_message.type){
//                 case "TYPE_HANDSHAKE":
//                     const nodes = _message.data;
//                     nodes.foreach(node => connect(node));
//             }
//         })
// })






async function connect(address){

    if(!connected.find(peerAddress => peerAddress === address) && address !== MY_ADDRESS){
        const socket = new wss(address);
    
        socket.on("open", ()=>{
            socket.send(JSON.stringify(produceMessage("TYPE_HANDSHAKE", [MY_ADDRESS, ...connected])));

            opened.forEach(node => node.socket.send(JSON.stringify(produceMessage("TYPE_HANDSHAKE", [address]))))

            if(!opened.find(peer => peer.address === address) && address !== MY_ADDRESS){
                opened.push({socket, address})
            }
            if(!connected.find(peerAddress => peerAddress === address) && address !== MY_ADDRESS){
                connected.push(address)
            }
        });

        socket.on("close", ()=>{
            opened.splice(connected.indexOf(address), 1)
            connected.splice(connected.indexOf(address), 1)
        })
    }
}



function produceMessage(type, data){
    return {type, data};
}



peers.forEach(peer => connect(peer))

console.log(new Date() + "Server is listning on port " + PORT)
console.log( "Directory name " +  __dirname)



// const socket = new ws();

// socket.on("open", ()=>{
    
// })
// socket.on("close", ()=>{

// })
// socket.on("message", ()=>{

// }) 