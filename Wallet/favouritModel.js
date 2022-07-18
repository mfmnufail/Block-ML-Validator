const { v4 } =  require ('uuid');
const { verifySignature } = require('../utils');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const {mlcoin} = require("../blockchain/networkNode");
const { ec, cryptoHash } = require("../utils");


class FavouritModel {
  constructor({ publickey}) {
    this.id = v4();
    this.publickey = publickey;
    this.models = {};
    this.merkleHash = null;
    this.flag = null;
    this.datasetAddress = null
  


    // this.input = this.createInput({senderWallet,modelAddress})
    // this.datasetAddress = datasetAddress; 
    // this.description = this.getDataDescription({ datasetAddress });
    // this.modelAddress = modelAddress
    // this.flag = flag
    // this.timestamp = Date.now();
  }

  addFavouritModel({datasetAddress, modelAddress, performance, flag}){
    this.datasetAddress = datasetAddress;
    this.flag = flag.toLowerCase();

    if(flag === "classification"){
        this.models[modelAddress] = performance
        let sortable = Object.fromEntries(
            Object.entries(this.models).sort(([,a],[,b]) => a-b)
        );
      this.models = sortable;
      this.merkleHash = cryptoHash(this.models)
    }

    if(flag === "regresssion")
      this.models[modelAddress] = performance
      this.models[modelAddress] = performance
      let sortable = Object.fromEntries(
          Object.entries(this.models).sort(([,a],[,b]) => b-a)
      );
    this.models = sortable;
    this.merkleHash = cryptoHash(this.models)
  }

  getModelDetails(){
    return {
     publickey: this.publicKey,
     datasetAddress: this.datasetAddress,
     flag: this.flag,
     models: this.models,
     merkleHash: this.merkleHash
    }
  }

  // getDataDescription({ datasetAddress }) {
  //   const found = mlcoin.pendingDataTransactions.find(e => e.contentAddress === datasetAddress)
  //   return found;
  // }

//   getDeadline({ datasetAddress }){
//     const found = mlcoin.pendingDataTransactions.find(e => e.contentAddress === datasetAddress)

//     return {
//       deadline :found.deadline - Date.now(),
//       isAcceptable : found.deadline - Date.now() >= 0
//     };
//   }
 
//   createInput({ senderWallet, modelAddress }) {
//     return {
//       timestamp: Date.now(),
//       amount: senderWallet.balance,
//       address: senderWallet.publicKey,
//       signature: senderWallet.sign(modelAddress)
//     };
//   }

  

//   static validModel(transaction) {
//     const { input: { address, signature }, modelAddress } = transaction;

//     if (!verifySignature({ publicKey: address, data: modelAddress, signature })) {
//       console.error(`Invalid signature from ${address}`);
//       return false;
//     }

//     return true;
//   }

  // static rewardTransaction({ minerWallet }) {
  //   return new this({
  //     input: REWARD_INPUT,
  //     outputMap: { [minerWallet.publicKey]: MINING_REWARD }
  //   });
  // }
}

module.exports = FavouritModel;