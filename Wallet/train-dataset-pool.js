const TrainDataset = require('./train-dataset');

class TrainDatasetPool  {
  constructor() {
    this.trainDatasetMap = {};
  }

  clear() {
    this.trainDatasetMap = {};
  }

  setTrainDatasetTransaction(trainDataset) {
    this.trainDatasetMap[trainDataset.id] = trainDataset;
  }

  setMap(trainDatasetMap) {
    this.trainDatasetMap = trainDatasetMap;
  }

  getMap(){
    return this.trainDatasetMap;
  }

  existingTransaction({ inputAddress }) {
    const trainDatasets = Object.values(this.trainDatasetMap);

    return trainDatasets.find(trainDataset => trainDataset.input.address === inputAddress);
  }

  validTransactions() {
    return Object.values(this.trainDatasetMap).filter(
      trainDataset => TrainDataset.validTransaction(trainDataset)
    );
  }

  clearBlockchainTransactions({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];

      for (let trainDataset of block.data) {
        if (this.trainDatasetMap[trainDataset.id]) {
          delete this.trainDatasetMap[trainDataset.id];
        }
      }
    }
  }
}

module.exports = TrainDatasetPool;
