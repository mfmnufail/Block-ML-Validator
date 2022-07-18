const { v4 } =  require ('uuid');
const { verifySignature } = require('../utils');
const { REWARD_INPUT, MINING_REWARD, COMPETITION_DEADLINE } = require('../config');
const {mlcoin} = require("../blockchain/networkNode");


class TrainDataset {
  constructor({ senderWallet, datasetAddress, description, flag }) {
    this.id = v4();
    this.senderWallet = senderWallet;
    this.input = this.createInput({senderWallet,datasetAddress})
    this.datasetAddress = datasetAddress; 
    this.description = description;
    this.flag = flag
    this.timestamp = Date.now();
    this.deadline = this.timestamp + COMPETITION_DEADLINE
  }

  getModelDetails(){
    return {
      senderWallet: this.senderWallet.publicKey,
      datasetAddress:this.datasetAddress,
      description:this.description,
      deadline:this.deadline,
      flag:this.flag
    }
  }

//   getDataDescription({ datasetAddress }) {
//     // const outputMap = {};
//     const found = mlcoin.pendingDataTransactions.find(e => e.contentAddress === datasetAddress)
//     return found;
//   }

  // getDeadline({ datasetAddress }){
  //   const found = mlcoin.pendingDataTransactions.find(e => e.contentAddress === datasetAddress)

  //   return {
  //     deadline :found.deadline - Date.now(),
  //     isAcceptable : found.deadline - Date.now() >= 0
  //   };
  // }
 
  createInput({ senderWallet, datasetAddress }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(datasetAddress)
    };
  }

  

  static validDataset(transaction) {
    const { input: { address, signature }, datasetAddress } = transaction;

    if (!verifySignature({ publicKey: address, data: datasetAddress, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  // static rewardTransaction({ minerWallet }) {
  //   return new this({
  //     input: REWARD_INPUT,
  //     outputMap: { [minerWallet.publicKey]: MINING_REWARD }
  //   });
  // }
}

module.exports = TrainDataset;