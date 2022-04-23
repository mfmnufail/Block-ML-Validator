const sha256 = require('sha256');
const { v4 } =  require ('uuid');
const currentNodeUrl = process.argv[3];
const Block = require("./block");
const {GENESIS_DATA} = require("../config");

class Blockchain {

  constructor() {
    
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];

    this.createNewBlock(GENESIS_DATA.nonce,GENESIS_DATA.hash,GENESIS_DATA.previousBlockHash);
  }

  createNewBlock(nonce, hash, previousBlockHash) {
    const newBlockContains = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce: nonce,
      hash: hash,
      previousBlockHash: previousBlockHash,
    };

    this.pendingTransactions = [];
    const newBlock = new Block(newBlockContains);
    this.chain.push(newBlock);

    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
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
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()["index"] + 1;
  }

 
  chainIsValid(blockchain){
    let validChain = true;

    for(let i=1 ; i< blockchain.length ; ++i){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
        if (blockHash.substring(0, 4) !== '0000') validChain = false;
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
    }

    const genesisBlock = blockchain[0];
    const correctTransactions = genesisBlock['transactions'].length === 0;
    if (!correctTransactions) validChain = false;

    return validChain;

  }

   
  proofOfWork(previousBlockHash,currentBlockData){
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce)
    while(hash.substring(0,4) !== '0000'){
      nonce++;
      hash = this.hashBlock(previousBlockHash,currentBlockData,nonce)
    }

    return nonce;
  }



  hashBlock(previousBlockHash,currentBlockData,nonce){
    const dataString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataString);
    return hash;
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


  replaceChain(mlcoin,blockchain){
    
   
      const currentChainLength = mlcoin.chain.length;
      let maxChainLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransactions = null;
  
    
    
        if (blockchain.chain.length > maxChainLength) {
          maxChainLength = blockchain.chain.length;
          newLongestChain = blockchain;
          newPendingTransactions = blockchain.chain.pendingTransactions;
        }
      
  
      if (!newLongestChain ||(newLongestChain && !mlcoin.chainIsValid(newLongestChain))) {

        console.log("Current chain has not been replaced.")

        return {
          note: "Current chain has not been replaced.",
          chain: mlcoin.chain,
        };
      } else {
        mlcoin.chain = newLongestChain;
        mlcoin.pendingTransactions = newPendingTransactions;

        console.log("This chain has been replaced.")
        return{
          note: "This chain has been replaced.",
          chain: mlcoin.chain,
        };
      }
    
  }



}

module.exports = Blockchain;
