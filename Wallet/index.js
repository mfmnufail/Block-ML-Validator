const TrainDatasetTransaction = require("./train-dataset");
const TestDatasetTransaction = require("./test-dataset");
const ModelTransaction = require("./model");
const FavouritModel = require('./favouritModel')
const { STARTING_BALANCE, STARTING_REPUTATION } = require("../config");
const { ALPHA } = require("../config");
const { ec, cryptoHash } = require("../Utils");

class Wallet {
  constructor() {
    this.reputation = STARTING_REPUTATION;
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTrainDatasetTransaction({ datasetAddress,description, flag, chain }) {
   

    return new TrainDatasetTransaction({ senderWallet: this, datasetAddress,description,flag });
  }

  getPublickey(){
    return this.publicKey;
  }

  createTestDatasetTransaction({trainDatasetAddress, testDatasetAddress, description, flag, trainTransaction, chain}){
    if (chain) {
      this.reputation = Wallet.calculateReputation({
        chain,
        address: this.publicKey,
      });
    }
    return new TestDatasetTransaction({senderWallet: this, trainDatasetAddress, testDatasetAddress, description, flag, trainTransaction})
  }

  createModelTransaction({datasetAddress, modelAddress, flag, trainTransaction}){
    return new ModelTransaction({senderWallet: this, datasetAddress, modelAddress, flag, trainTransaction})
  }

  createFavouritModel({ datasetAddress,flag}){
    return new FavouritModel({ senderWallet:this, datasetAddress,flag})
  }

  


   static calculateReputation({ chain, publicKey }) {
    let hasConductedTransaction = false;
    let count = 0;
    let reputationTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.trainDataTransaction) {
        if (transaction.senderWallet === publicKey) {
          hasConductedTransaction = true;
          count++;
        }
      }

    }

    for (let i = 0; chain.pendingTrainDataTransactions.length > i; i++) {
     
        if (chain.pendingTrainDataTransactions[i].senderWallet === publicKey) {
          hasConductedTransaction = true;
          count++;
        }
      

    }

    
    this.reputation = this.reputation +  ALPHA * Math.log2(count+1);

    return hasConductedTransaction
      ? this.reputation
      : STARTING_REPUTATION;
  }
}

module.exports = Wallet;
