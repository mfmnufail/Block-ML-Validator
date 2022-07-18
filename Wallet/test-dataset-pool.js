const TestDataset = require('./test-dataset');

class TestDatasetPool  {
  constructor() {
    this.testDatasetMap = {};
  }

  clear() {
    this.testDatasetMap = {};
  }

  setTestDatasetTransaction(testDataset) {
    this.testDatasetMap[testDataset.id] = testDataset;
  }

  setMap(testDatasetMap) {
    this.testDatasetMap = testDatasetMap;
  }

  getMap(){
    return this.testDatasetMap;
  }

  existingTransaction({ inputAddress }) {
    const testDatasets = Object.values(this.testDatasetMap);

    return testDatasets.find(testDataset => testDataset.input.address === inputAddress);
  }

  validTransactions() {
    return Object.values(this.testDatasetMap).filter(
      testDataset => TestDataset.validTransaction(testDataset)
    );
  }

  clearBlockchainTransactions({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];

      for (let testDataset of block.data) {
        if (this.testDatasetMap[testDataset.id]) {
          delete this.testDatasetMap[testDataset.id];
        }
      }
    }
  }
}

module.exports = TestDatasetPool;
