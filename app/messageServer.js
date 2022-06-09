var topology = require("fully-connected-topology")
var jsonStream = require("duplex-json-stream")
var streamSet = require("stream-set")
// var register = require('register-multicast-dns')

var address = process.argv[2]
var peers = process.argv.slice(3)
var swarm = topology(address,peers);
var streams = streamSet()

const Blockchain = require("../blockchain/blockchain");
// const mlcoin = new Blockchain();
const {rpc, mlcoin} = require('../blockchain/networkNode')
const PubSub = require("./pubsub")


const REDIS_URL = 'redis://127.0.0.1:6379' ;
const pubsub = new PubSub({ mlcoin , redisUrl: REDIS_URL });
setTimeout(()=> pubsub.broadcastChain(), 1000)
// setTimeout(()=> pubsub.broadcastTransaction(), 1000)


const PORT = process.env.PORT || 3000

const MY_ADDRESS = `http://localhost:3000`
// const peers = []
let opened = []
let connected = []
let check = []
let checking = []
let chain = []
const DEFAULT_PORT = 3005;
let PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

rpc(PEER_PORT, pubsub);

swarm.on('connection', (peer)=>{
    console.log("[a friend joined!]")
    peer = jsonStream(peer)
    streams.add(peer)
  
  
    peer.on('data', (data)=>{
      console.log(data.username + "> " + data.message)
    //   streams.forEach(otherPeer=>{
    //     otherPeer.write(data)
    //   })
  
    })
  })
  
  process.stdin.on('data', (data)=>{
    streams.forEach((peer) => {
      peer.write({ username: address, message: data.toString().trim()})
    });
  })

  function produceMessage(ip, type, data){
    return {ip, type, data};
}



// io.on("connection", (socket)=>{
//     socket.on("message", message =>{
//         const _message = JSON.parse(message);
//         console.log(_message)

//         // switch(_message.type){
//         //     case "TYPE_HANDSHAKE":
//         //         const nodes = _message.data;
//         //         nodes.foreach(node => connect(node));
//         // }
//     })

// })




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






// async function connect(address){

//     if(!connected.find(peerAddress => peerAddress === address) && address !== MY_ADDRESS){
//         const socket = new wss(address);
    
//         socket.on("open", ()=>{
//             socket.send(JSON.stringify(produceMessage("TYPE_HANDSHAKE", [MY_ADDRESS, ...connected])));

//             opened.forEach(node => node.socket.send(JSON.stringify(produceMessage("TYPE_HANDSHAKE", [address]))))

//             if(!opened.find(peer => peer.address === address) && address !== MY_ADDRESS){
//                 opened.push({socket, address})
//             }
//             if(!connected.find(peerAddress => peerAddress === address) && address !== MY_ADDRESS){
//                 connected.push(address)
//             }
//         });

//         socket.on("close", ()=>{
//             opened.splice(connected.indexOf(address), 1)
//             connected.splice(connected.indexOf(address), 1)
//         })
//     }
// }











