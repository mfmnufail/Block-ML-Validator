// const redis = require('redis');
var topology = require("fully-connected-topology")
var jsonStream = require("duplex-json-stream")
var streamSet = require("stream-set")

var address = process.argv[2]
var peers = process.argv.slice(3)
var swarm = topology(address,peers);
var streams = streamSet()

const {rpc,mlcoin, wallet, modelPool,favouriteModelPool,contractPool} = require('../blockchain/networkNode')
const DEFAULT_PORT = 3005;
let PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 10);
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

    // this.publisher = redis.createClient(redisUrl);
    // this.subscriber = redis.createClient(redisUrl);

    // this.subscribeToChannels();

    // this.subscriber.on(
    //   'message',
    //   (channel, message) => this.handleMessage(channel, message)
    // );
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

  // subscribeToChannels() {
  //   Object.values(CHANNELS).forEach(channel => {
  //     this.subscriber.subscribe(channel);
  //   });
  // }

  // publish({ channel, message }) {
  //   this.subscriber.unsubscribe(channel, () => {
  //     this.publisher.publish(channel, message, () => {
  //       this.subscriber.subscribe(channel);
  //     });
  //   });
  // }

  createNewBlock(){
    validateNewBlock()

  }

  broadcastChain() {


    peerBroadcastMessage(JSON.stringify(this.blockchain))
  }

  broadcastTransaction(transaction) {
    peerBroadcastMessage(JSON.stringify(transaction))
  }


}

const REDIS_URL = 'redis://127.0.0.1:6379' ;
const pubsub = new PubNub({ mlcoin , redisUrl: REDIS_URL });
const BlockchainUtils = require("../Utils/BlockchainUtils")
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
        parsedMessage.contractAddress && mlcoin.addContractToPendingContractTransactions(parsedMessage) && contractPool.setModelTransaction(parsedMessage)
        parsedMessage.reputation && mlcoin.addReputationRating({publickey:parsedMessage.publickey, reputation:parsedMessage.reputation})
        parsedMessage.clearModel && favouriteModelPool.clear()

      if (data.seq <= received[data.from]) return // already received this one
      received[data.from] = data.seq
      streams.forEach(function (socket) {
        socket.write(data)
      })
      
    })
  
    streams.add(socket)
  })
  
  var seq = 0
  var id = Math.random()

    function peerBroadcastMessage(data){
    streams.forEach(function (socket) {
      if(data){
        var message = data.toString()
         socket.write({from: id, seq: seq++, username: address, message: message})
      }
    })
  }

 function validateNewBlock(){
 let validator = mlcoin.nextBlockValidator()
// let validator = mlcoin.getNextValidator()
 console.log("Selected block validator " + validator)
 console.log("The chain length " + mlcoin.chain.length)
  // if(mlcoin.chain.length === 1){
  //   if (validator === "bob"){
  //     console.log('i am the validator')
  //     newBlock = validatBlock()
  //     mlcoin.clearGenesisStake()
  //     peerBroadcastMessage(JSON.stringify(newBlock))
  //     }else{
  //       console.log('i am not a validator')
  //     }
  // }else{

    if (validator === wallet.getPublickey()){
      console.log("Wallet Owner" + wallet.getPublickey() + " but validator " + validator)
        console.log('i am the validator')
        newBlock = validatBlock({validator})
        peerBroadcastMessage(JSON.stringify(newBlock))
        }else{
          console.log("Wallet Owner" + wallet.getPublickey() + " but validator " + validator)
          console.log('i am not a validator')
        }
  // }
 }

 function validatBlock({validator}){
  // let nextValidator = mlcoin.nextBlockValidator()
  console.log("The block validator " + validator)
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

    const hash = BlockchainUtils.hashBlock(
      previousBlockHash,
      currentBlockData,
      validator
    );
  
    const newBlock = mlcoin.createNewBlock(hash, previousBlockHash,validator);
   
    peerBroadcastMessage(JSON.stringify(mlcoin))
 }


   function produceMessage(ip, type, data){
      return {ip, type, data};
  }
  

module.exports = PubNub;
