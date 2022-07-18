// const redis = require('redis');
// var {peerBroadcastMessage} = require('./messageServer');


// const CHANNELS = {
//   TEST: 'TEST',
//   BLOCKCHAIN: 'BLOCKCHAIN',
//   TRANSACTION: 'TRANSACTION'
// };

// class PubSub {
//   constructor({ mlcoin, redisUrl }) {
//     this.blockchain = mlcoin;
//     // this.transactionPool = pendingTransactions;

//     this.publisher = redis.createClient(redisUrl);
//     this.subscriber = redis.createClient(redisUrl);

//     this.subscribeToChannels();

//     this.subscriber.on(
//       'message',
//       (channel, message) => this.handleMessage(channel, message)
//     );
//   }

//   handleMessage(channel, message) {
//     // console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

//     const parsedMessage = JSON.parse(message);

//     switch(channel) {
//       case CHANNELS.BLOCKCHAIN:
//         this.blockchain.replaceChain(parsedMessage, this.blockchain)
//         peerBroadcastMessage(JSON.stringify(this.blockchain))
          
//         //   , true, () => {
//         //   this.transactionPool.clearBlockchainTransactions({
//         //     chain: parsedMessage
//         //   });
//         // });
//         break;
//       case CHANNELS.TRANSACTION:
//         this.blockchain.addTransactionToPendingTransactions(parsedMessage);
//         break;
//       default:
//         return;
//     }
//   }

//   subscribeToChannels() {
//     Object.values(CHANNELS).forEach(channel => {
//       this.subscriber.subscribe(channel);
//     });
//   }

//   publish({ channel, message }) {
//     this.subscriber.unsubscribe(channel, () => {
//       this.publisher.publish(channel, message, () => {
//         this.subscriber.subscribe(channel);
//       });
//     });
//   }

//   broadcastChain() {

//     this.publish({
//       channel: CHANNELS.BLOCKCHAIN,
//       message: JSON.stringify(this.blockchain)
//     });

    
//   }

//   broadcastTransaction(transaction) {
//     this.publish({
//       channel: CHANNELS.TRANSACTION,
//       message: JSON.stringify(transaction)
//     });
//   }
// }

// module.exports = PubSub;
