const FavouriteModel = require("./favouritModel");
const { DIFFICULTY_LEVEL } = require("../config");

class FavouriteModelPool {
  constructor() {
    this.favouriteModelMap = {};
  }

  clear() {
    this.favouriteModelMap = {};
  }

  setFavouriteModelTransaction(transaction) {
    this.favouriteModelMap[transaction.publickey] = { ...transaction };
  }

  setMap(favouriteModelMap) {
    this.favouriteModelMap = favouriteModelMap;
  }

  getMap() {
    return this.favouriteModelMap;
  }

  existingTransaction({ datasetAddress }) {
    const models = Object.values(this.favouriteModelMap);

    return models.find(
      (favmodel) => favmodel.datasetAddress === datasetAddress
    );
  }

  validTransactions() {
    return Object.values(this.favouriteModelMap).filter((model) =>
      Model.validTransaction(model)
    );
  }

  clearBlockchainTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let model of block.data) {
        if (this.favouriteModelMap[model.id]) {
          delete this.favouriteModelMap[model.id];
        }
      }
    }
  }

  validModelList() {
    let arr = Object.values(this.favouriteModelMap);
    let merkle = [];

    arr.map((e) => {
      merkle.push(e.merkleHash);
    });

    const counts = {};
    merkle.forEach((x) => {
      counts[x] = (counts[x] || 0) + 1;
    });

    let selectedMerkle = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    let selectedModelsIndex = 0

    arr.forEach((x,y) => {x.merkleHash === selectedMerkle; selectedModelsIndex = y} )
    return arr[selectedModelsIndex].models ;
  }

  // validatingRequired() {
  //   console.log(
  //     "The length of favourite pool " +
  //       Object.keys(this.favouriteModelMap).length
  //   );
  //   if (Object.keys(this.favouriteModelMap).length >= 1) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  /* This function iterate through the merkele root hash and find the 
    same number of most appeared merkle root hash. Finally it returns "true" only
    when it setisfiy the condition (difficulty level)
  */

  validatingRequired() {
    let arr = Object.values(this.favouriteModelMap);
    let merkle = [];

    arr.map((e) => {
      merkle.push(e.merkleHash);
    });

    const counts = {};
    merkle.forEach((x) => {
      counts[x] = (counts[x] || 0) + 1;
    });

    let maxDupplicates = Math.max.apply(null, Object.values(counts));
    return maxDupplicates >= DIFFICULTY_LEVEL;
  }

}

module.exports = FavouriteModelPool;
