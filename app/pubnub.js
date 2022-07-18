const redis = require('redis');


var topology = require("fully-connected-topology")
var jsonStream = require("duplex-json-stream")
var streamSet = require("stream-set")

var address = process.argv[2]
var peers = process.argv.slice(3)
var swarm = topology(address,peers);
var streams = streamSet()

const {rpc,mlcoin, wallet, modelPool,favouriteModelPool} = require('../blockchain/networkNode')
// const PubNub = require("./pubnub")
// const REDIS_URL = 'redis://127.0.0.1:6379' ;
// const pubsub = new PubNub({ mlcoin , redisUrl: REDIS_URL });
// setTimeout(()=> pubsub.broadcastChain(), 1000)
const DEFAULT_PORT = 3005;
let PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
// rpc(PEER_PORT, pubsub);
var received = {}


const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubNub {
  constructor({ mlcoin, redisUrl }) {
    this.blockchain = mlcoin;
    // this.transactionPool = pendingTransactions;

    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);

    this.subscribeToChannels();

    this.subscriber.on(
      'message',
      (channel, message) => this.handleMessage(channel, message)
    );
  }

  handleMessage(channel, message) {
    // console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

    const parsedMessage = JSON.parse(message);

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        // this.blockchain.replaceChain(parsedMessage, this.blockchain)
        // peerBroadcastMessage(JSON.stringify(this.blockchain))
          
        //   , true, () => {
        //   this.transactionPool.clearBlockchainTransactions({
        //     chain: parsedMessage
        //   });
        // });
        break;
      case CHANNELS.TRANSACTION:
        // this.blockchain.addTransactionToPendingTransactions(parsedMessage);
        break;
      default:
        return;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  createNewBlock(){
    validateNewBlock()

  }

  broadcastChain() {

    // this.publish({
    //   channel: CHANNELS.BLOCKCHAIN,
    //   message: JSON.stringify(this.blockchain)
    // });

    peerBroadcastMessage(JSON.stringify(this.blockchain))
    // console.log(this.blockchain.pendingModelTransactions ? this.blockchain.pendingModelTransactions[0] : null)

    
  }

  broadcastTransaction(transaction) {
    // this.publish({
    //   channel: CHANNELS.TRANSACTION,
    //   message: JSON.stringify(transaction)
    // });

    peerBroadcastMessage(JSON.stringify(transaction))
  }


}

const REDIS_URL = 'redis://127.0.0.1:6379' ;
const pubsub = new PubNub({ mlcoin , redisUrl: REDIS_URL });
const BlockchainUtils = require("../Utils/BlockchainUtils")
// setTimeout(()=> pubsub.broadcastChain(), 1000)
// setTimeout(()=> pubsub.broadcastTransaction(), 1000)
rpc(PEER_PORT, pubsub);

swarm.on('connection', function (socket, id) {
    console.log('info> direct connection to', id)

 
    socket = jsonStream(socket)
    socket.on('data', function (data) {

    
        
        const parsedMessage = JSON.parse(data.message)

        parsedMessage.chain && mlcoin.replaceChain(parsedMessage, mlcoin)
        parsedMessage.testDatasetAddress && mlcoin.addTestDataTransactionToPendingDataTransactions(parsedMessage)
        parsedMessage.merkleHash && favouriteModelPool.setFavouriteModelTransaction(parsedMessage)
        parsedMessage.datasetAddress && parsedMessage.description && mlcoin.addTrainDataTransactionToPendingDataTransactions(parsedMessage)
        parsedMessage.sender && mlcoin.addTransactionToPendingTransactions(parsedMessage);
        parsedMessage.datasetAddress && parsedMessage.modelAddress && !parsedMessage.performance && modelPool.setModelTransaction(parsedMessage);
        parsedMessage.reputation && mlcoin.addReputationRating(parsedMessage)

        // parsedMessage.modelAddress && mlcoin.addModelTransactionToPendingModelTransactions(parsedMessage);


        console.log("This is the parsed Message " , parsedMessage)
        // console.log("This is the parsed Message " , parsedMessage.chain)

      if (data.seq <= received[data.from]) return // already received this one
      received[data.from] = data.seq
    //   console.log(data.username + '> ' + data.message )
      streams.forEach(function (socket) {
        socket.write(data)
      })
      
    })
  
    streams.add(socket)
  })
  
  var seq = 0
  var id = Math.random()
  
//   process.stdin.on('data', function (data) {
//     streams.forEach(function (socket) {
//       var message = data.toString().trim()
//       socket.write({from: id, seq: seq++, username: address, message: message})
//     })
//   })
  
  
    function peerBroadcastMessage(data){
    streams.forEach(function (socket) {
      if(data){
        var message = data.toString()
         socket.write({from: id, seq: seq++, username: address, message: message})
      }
    })
  }

 function validateNewBlock(){
 let validator = mlcoin.nextValidator()
 console.log("The validator " + validator)
 console.log("The chain length" + mlcoin.chain.length)
  if(mlcoin.chain.length === 1){
    if (validator === "bob"){
      console.log('i am the validator')
      newBlock = validatBlock({validator})
      peerBroadcastMessage(JSON.stringify(newBlock))
      // block = sblockchain.createBlock(
      //     self.transactionPool.transactions, self.wallet)
      // self.transactionPool.removeFromPool(
      //     self.transactionPool.transactions)
      // message = Message(self.p2p.socketConnector, 'BLOCK', block)
      // self.p2p.broadcast(BlockchainUtils.encode(message))

      }else{
        console.log('i am not a validator')
      }
  }else{

    if (validator == wallet.getPublickey()){
        console.log('i am the validator')
        newBlock = validatBlock({validator})
        peerBroadcastMessage(JSON.stringify(newBlock))
        // block = sblockchain.createBlock(
        //     self.transactionPool.transactions, self.wallet)
        // self.transactionPool.removeFromPool(
        //     self.transactionPool.transactions)
        // message = Message(self.p2p.socketConnector, 'BLOCK', block)
        // self.p2p.broadcast(BlockchainUtils.encode(message))
  
        }else{
          console.log('i am not a validator')
        }
  }
 }

 function validatBlock({validator}){
  const lastBlock = mlcoin.getLastBlock();
    const previousBlockHash = lastBlock["hash"];
    const coinbase = mlcoin.createNewTransaction(6.25, "00", validator)
    mlcoin.addTransactionToPendingTransactions(coinbase)
    
    const currentBlockData = {
      transactions: mlcoin.pendingTransactions,
      trainDataTransaction:mlcoin.pendingTrainDataTransactions,
      testDataTransaction:mlcoin.pendingTestDataTransactions,
      modelTransaction: mlcoin.pendingModelTransactions,
      index: lastBlock["index"] + 1,
    };
    // const nonce = mlcoin.proofOfWork(previousBlockHash, currentBlockData);
    const hash = BlockchainUtils.hashBlock(
      previousBlockHash,
      currentBlockData,
      validator
    );
  
    const newBlock = mlcoin.createNewBlock(mlcoin.nextValidator(), hash, previousBlockHash);
    peerBroadcastMessage(JSON.stringify(mlcoin))
 }


  
  //  function receiveMessage(){
  //   swarm.on('connection', function (socket, id) {
  //     console.log('info> direct connection to', id)
    
  //     socket = jsonStream(socket)
  //     socket.on('data', function (data) {
  //       if (data.seq <= received[data.from]) return // already received this one
  //       received[data.from] = data.seq
  //       console.log(data.username + '> ' + data.message )
  //       streams.forEach(function (socket) {
  //         socket.write(data)
  //       })
  //     })
    
  //     streams.add(socket)
  //   })
  // }
  
  
   function produceMessage(ip, type, data){
      return {ip, type, data};
  }
  

module.exports = PubNub;
