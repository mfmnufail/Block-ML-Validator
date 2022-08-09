const { v4 } =  require ('uuid');
const { verifySignature } = require('../Utils');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const {mlcoin} = require("../blockchain/networkNode");


class Model {
  constructor({ senderWallet,datasetAddress, modelAddress, flag, trainTransaction }) {
    this.id = v4();
    this.trainTransaction = trainTransaction
    this.senderWallet = senderWallet,
    this.input = this.createInput({senderWallet,modelAddress})
    this.datasetAddress = datasetAddress; 
    this.description = this.getDataDescription({ datasetAddress });
    this.modelAddress = modelAddress
    this.flag = flag
    this.timestamp = Date.now();
    this.deadline = this.getDeadline({ datasetAddress });
  }

  getModelDetails(){
    return {
      senderWallet : this.senderWallet.publicKey,
      datasetAddress: this.datasetAddress,
      modelAddress: this.modelAddress,
      deadline : this.deadline
    }
  }

  getDataDescription({ datasetAddress }) {
    // const outputMap = {};
    const found = this.trainTransaction.find(e => e.datasetAddress === datasetAddress)
    return found.description;
  }

  getDeadline({ datasetAddress }){
    const found = this.trainTransaction.find(e => e.datasetAddress === datasetAddress)

    return {
      deadline :found.deadline - Date.now(),
      isAcceptable : found.deadline - Date.now() >= 0
    };
  }
 
  createInput({ senderWallet, modelAddress }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(modelAddress)
    };
  }

  

  static validModel(transaction) {
    const { input: { address, signature }, modelAddress } = transaction;

    if (!verifySignature({ publicKey: address, data: modelAddress, signature })) {
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

module.exports = Model;