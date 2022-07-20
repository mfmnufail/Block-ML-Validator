const sha256 = require('sha256');
const { v4 } =  require ('uuid');
const currentNodeUrl = process.argv[3];
const Block = require("./block");
const {GENESIS_DATA} = require("../config");
const BlockchainUtils = require("../Utils/BlockchainUtils")
const ReputationStake = require('../Chosen/reputationStake')
const {cryptoHash} = require('../Utils')
const reputationStake = new ReputationStake();
// const Model = require('../Wallet/model')


class Blockchain {

  constructor() {
    
    this.chain = [];
    this.pendingTransactions = [];
    this.pendingTrainDataTransactions = [];
    this.pendingTestDataTransactions = [];
    this.pendingModelTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    this.reputation = {}
    this.validators = {}

    this.createNewBlock(GENESIS_DATA.nonce,GENESIS_DATA.hash,GENESIS_DATA.previousBlockHash,GENESIS_DATA.nextValidator);
  }

  createNewBlock(validator, hash, previousBlockHash) {
    const newBlockContains = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      trainDataTransaction: this.pendingTrainDataTransactions,
      testDataTransaction: this.pendingTestDataTransactions,
      modelTransaction: this.pendingModelTransactions,
      hash: hash,
      previousBlockHash: previousBlockHash,
      nextValidator : validator,
      reputation : this.reputation
    };


    const newBlock = new Block(newBlockContains);
    this.chain.push(newBlock);
    this.pendingTransactions = [];
    this.pendingTrainDataTransactions = [];
    this.pendingTestDataTransactions=[];
    this.pendingModelTransactions =[];
    this.networkNodes = [];
    this.reputation = {}

    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createDataTransaction(sender, contentAddress, description,deadline, flag){
    const newDataTransaction = {
      sender: sender,
      contentAddress: contentAddress,
      description: description,
      deadline: deadline,
      flag: flag,
      transactionId: v4().split("-").join("")
    };

    return newDataTransaction;
  }

  addTrainDataTransactionToPendingDataTransactions(dataTransactionObj) {

    if( this.addUniqeTrainDataset(dataTransactionObj) === -1) {
      this.pendingTrainDataTransactions?  this.pendingTrainDataTransactions.push(dataTransactionObj) : null ; 
      return this.getLastBlock()["index"] + 1;
    }

  }

  addTestDataTransactionToPendingDataTransactions(dataTransactionObj) {

    if( this.addUniqeTestDataset(dataTransactionObj) === -1) {
      if(this.chain.length === 1){
        reputationStake.update("bob",dataTransactionObj.reputation)
      }else{
        reputationStake.update(dataTransactionObj.senderwallet,dataTransactionObj.reputation)
      }
      this.pendingTestDataTransactions?  this.pendingTestDataTransactions.push(dataTransactionObj) : null ; 
      this.validators = reputationStake.stakers
      return this.getLastBlock()["index"] + 1;
    }

  }

  addModelTransactionToPendingModelTransactions(modelTransactionObj) {
    if( this.addUniqeModel(modelTransactionObj) === -1) {
    this.pendingModelTransactions ? this.pendingModelTransactions.push(modelTransactionObj.sender = modelTransactionObj) : null;
    return this.getLastBlock()["index"] + 1;
    }
  }

  addReputationRating({publickey, reputation}){
    this.reputation[publickey] = {...reputation}
  }


  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      amount: amount,
      sender: sender,
      recipient: recipient,
      transactionId: v4().split("-").join(""),
    };

    return newTransaction;
  }

  addTransactionToPendingTransactions(transactionObj) {
    
    if( this.addUniqeTransaction(transactionObj) === -1) {
    this.pendingTransactions ? this.pendingTransactions.push(transactionObj) : null;
    return this.getLastBlock()["index"] + 1;
  }

}

   addUniqeTransaction(data) {
    let index = -1;
    for(let i = 0; i < this.pendingTransactions.length; i++) {
      if(this.pendingTransactions[i].transactionId === data.transactionId) {
        return index = i;
      }
    }

    return index;
  
  }

  addUniqeTrainDataset(data) {
    let index = -1;
    for(let i = 0; i < this.pendingTrainDataTransactions.length; i++) {
      if(this.pendingTrainDataTransactions[i].datasetAddress === data.datasetAddress) {
        return index = i;
      }
    }

    return index;
  
  }

  addUniqeTestDataset(data) {
    let index = -1;
    for(let i = 0; i < this.pendingTestDataTransactions.length; i++) {
      if(this.pendingTestDataTransactions[i].trainDatasetAddress === data.trainDatasetAddress) {
        return index = i;
      }
    }

    return index;
  
  }

  addUniqeModel(data) {
    let index = -1;
    for(let i = 0; i < this.pendingModelTransactions.length; i++) {
      if(this.pendingModelTransactions[i].modelAddress === data.modelAddress) {
        return index = i;
      }
    }

    return index;
  
  }

 
  chainIsValid(blockchain){
    let validChain = true;

    for(let i=1 ; i< blockchain.length ; ++i){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = BlockchainUtils.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
        if (blockHash.substring(0, 4) !== '0000') validChain = false;
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
    }

    const genesisBlock = blockchain[0];

    console.log("Genesis block >>", blockchain)
    const correctTransactions = genesisBlock['transactions'].length === 0;
    if (!correctTransactions) validChain = false;

    return validChain;

  }

   nextValidator(){
       let lastBlockHash =  cryptoHash(this.getLastBlock().hash)
       console.log("The last block hash " + lastBlockHash)
        let nextValidator = reputationStake.validator(lastBlockHash)
        return nextValidator
    }

   validValidator(block){
    validatorPublicKey = reputationStake.validator(block.hash)
    proposedBlockValidator = block.validator
    if (validatorPublicKey == proposedBlockValidator){
        return true;
    }else{
        return false;
    }
   }
        


  getBlock(blockHash){
    let correctBlock = null;
    this.chain.forEach(block =>{
      if(block.hash === blockHash) correctBlock = block;
    });

    return correctBlock;
  }

  getTransaction(transactionId){

    let correctTransaction = null;
    let correctBlock = null;

    this.chain.forEach(block=>{
      block.transactions.forEach(tnx =>{
        if(tnx.transactionId === transactionId){
          correctTransaction = tnx;
          correctBlock = block;
        } 
      })
    })

    return  {
     transaction : correctTransaction,
     block : correctBlock
    };


  }

  

  getAddressData(address){

    let addressTransactions = [];

    this.chain.forEach(block =>{
      block.transactions.forEach(tnx =>{
        if(tnx.sender === address || tnx.recipient === address){
          addressTransactions.push(tnx);
        }; 
      });
    });


    let balance = 0;

    addressTransactions.forEach(tnx =>{
      if(tnx.recipient === address) balance += tnx.amount;
      if(tnx.sender === address) balance -= tnx.amount;
    })

    return {
      addressTransactions : addressTransactions,
      addressBalance : balance
    };


  };


  replaceChain(blockchain,mlcoin){

    console.log("This is the mlcoin from replaceChain >>>", mlcoin.chain.length)
    // console.log("This is the blockchain from replaceChain >>>", blockchain.chain.length)
    
   
      const currentChainLength = mlcoin.chain ? mlcoin.chain.length : 0;
      let maxChainLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransactions = null;
  
    
    
        if (blockchain.chain.length > mlcoin.chain.length ) {
          maxChainLength = blockchain.chain.length;
          newLongestChain = blockchain;
          // newPendingTransactions = blockchain.chain.pendingTransactions;
        }

        

        console.log("Old chain length >>>" + mlcoin.chain.length)
        console.log("New chain length >>>" + blockchain.chain.length)
      
  
      if (!blockchain ||(blockchain && this.chainIsValid(blockchain.chain))) {
        console.log("newLongestChain" + blockchain)
        console.log("chainIsValid" + this.chainIsValid(blockchain.chain))

        console.log("Current chain has not been replaced.")

        return {
    
          note: "Current chain has not been replaced.",
          chain: mlcoin.chain,
        };
      } else {
        console.log("<<<< chain has been replaced>>>>")
        mlcoin.chain = blockchain.chain;
        mlcoin.pendingTransactions = blockchain.pendingTransactions;
        mlcoin.pendingTrainDataTransactions = blockchain.pendingTrainDataTransactions;
        mlcoin.pendingTestDataTransactions = blockchain.pendingTestDataTransactions;
        mlcoin.pendingModelTransactions = blockchain.pendingModelTransactions;

        // console.log("This chain has been replaced.")
        return{
          note: "This chain has been replaced.",
          chain: mlcoin.chain,
        };
      }
    
  }



}

module.exports = Blockchain;
