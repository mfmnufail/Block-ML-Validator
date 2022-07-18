class Block {


    constructor({index,transactions,trainDataTransaction,testDataTransaction,modelTransaction,nonce,hash,previousBlockHash,nextValidator,reputation}){
        this.index = index;
        this.timstamp = Date.now();
        this.transactions = transactions;
        this.trainDataTransaction = trainDataTransaction
        this.testDataTransaction = testDataTransaction
        this.modelTransaction = modelTransaction
        this.nonce = nonce;
        this.hash = hash;
        this.previousBlockHash = previousBlockHash;
        this.nextValidator = nextValidator
        this.reputation = reputation
    }


    // static genesis(){
    //     return new this(GENESIS_DATA)
    // }

    // static createNewBlock(index,transaction,nonce,hash,previousBlockHash){
    //     const newBlock={
    //             index: index,
    //             timstamp: Date.now(),
    //             transaction: transaction,
    //             nonce : nonce,
    //             hash : hash,
    //             previousBlockHash : previousBlockHash

    //     };


    // }

    
    
}
module.exports = Block;