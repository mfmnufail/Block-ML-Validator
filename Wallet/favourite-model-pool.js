const FavouriteModel = require('./favouritModel');

class FavouriteModelPool {
  constructor() {
    this.favouriteModelMap = {};
  }

  clear() {
    this.favouriteModelMap = {};
  }

  setFavouriteModelTransaction(transaction) {
    this.favouriteModelMap[transaction.publickey] = {...transaction};
  }

  setMap(favouriteModelMap) {
    this.favouriteModelMap = favouriteModelMap;
  }

  getMap(){
    return this.favouriteModelMap;
  }

  existingTransaction({ datasetAddress }) {
    const models = Object.values(this.favouriteModelMap);

    return models.find(favmodel => favmodel.datasetAddress === datasetAddress);
  }

  validTransactions() {
    return Object.values(this.favouriteModelMap).filter(
      model => Model.validTransaction(model)
    );
  }

  clearBlockchainTransactions({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];

      for (let model of block.data) {
        if (this.favouriteModelMap[model.id]) {
          delete this.favouriteModelMap[model.id];
        }
      }
    }
  }

   validatingRequired(){

    console.log("The length of favourite pool " + Object.keys(this.favouriteModelMap ).length)
        if (Object.keys(this.favouriteModelMap ).length === 1){
            return true
        }else{
            return false
        }
   }
}

module.exports = FavouriteModelPool;
