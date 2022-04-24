const redis = require('redis');

const CHANNELS = {
//   TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
//   TRANSACTION: 'TRANSACTION'
};


class PubSub {
    constructor() {
    //   this.blockchain = blockchain;
    //   this.transactionPool = transactionPool;
  
      this.publisher = redis.createClient();
      this.subscriber = redis.createClient();
  
    //   this.subscribeToChannels();

    this.subscriber.subscribe(CHANNELS.BLOCKCHAIN)
  
      this.subscriber.on(
        'message',
        (channel, message) => this.handleMessage(channel, message)
      );
    }
  
    handleMessage(channel, message) {

        console.log("Message : ", message)
        console.log("Channel : ", channel)

    }

}

const testPubSub = new PubSub()

setTimeout(()=>testPubSub.publisher.publish(CHANNELS.BLOCKCHAIN, "foo"),1000) 