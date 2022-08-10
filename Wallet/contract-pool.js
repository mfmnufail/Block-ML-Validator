// const Model = require('./model');

class ContractPool {
  constructor() {
    this.contractMap = {};
  }

  clear() {
    this.contractMap = {};
  }

  setContractTransaction(transaction) {
    this.contractMap[transaction.blockHash] = {...transaction};
  }

  setMap(contractMap) {
    this.contractMap = contractMap;
  }

  getMap(){
    return this.contractMap;
  }

  existingContractTransaction({ blockHash }) {
    const contracts = Object.values(this.contractMap);

    return contracts.find(contract => contract.blockHash === blockHash);
  }

 

}

module.exports = ContractPool;
