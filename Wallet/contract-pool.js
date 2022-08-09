const Model = require('./model');

class ModelPool {
  constructor() {
    this.modelMap = [];
  }

  clear() {
    this.modelMap = [];
  }

  setModelTransaction(transaction) {
    this.modelMap.push(transaction);
  }

  setMap(modelMap) {
    this.modelMap = modelMap;
  }

  getMap(){
    return this.modelMap;
  }

  existingTransaction({ blockHash }) {
    const models = Object.values(this.modelMap);

    return models.find(contract => contract.blockHash === blockHash);
  }

 

}

module.exports = ModelPool;
