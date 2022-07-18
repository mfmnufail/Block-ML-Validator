const Model = require('./model');

class ModelPool {
  constructor() {
    this.modelMap = {};
  }

  clear() {
    this.modelMap = {};
  }

  setModelTransaction(transaction) {
    this.modelMap[transaction.id] = transaction;
  }

  setMap(modelMap) {
    this.modelMap = modelMap;
  }

  getMap(){
    return this.modelMap;
  }

  existingTransaction({ inputAddress }) {
    const models = Object.values(this.modelMap);

    return models.find(model => model.input.address === inputAddress);
  }

  validTransactions() {
    return Object.values(this.modelMap).filter(
      model => Model.validTransaction(model)
    );
  }

  clearBlockchainTransactions({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];

      for (let model of block.data) {
        if (this.modelMap[model.id]) {
          delete this.modelMap[model.id];
        }
      }
    }
  }
}

module.exports = ModelPool;
