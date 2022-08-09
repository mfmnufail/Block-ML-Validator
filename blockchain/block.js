class Block {


    constructor({index,transactions,trainDataTransaction,testDataTransaction,modelTransaction,contractTransactions,nonce,hash,previousBlockHash,blockValidator,reputation}){
        this.index = index;
        this.timstamp = Date.now();
        this.transactions = transactions;
        this.trainDataTransaction = trainDataTransaction
        this.testDataTransaction = testDataTransaction
        this.modelTransaction = modelTransaction
        this.contractTransactions = contractTransactions;
        this.nonce = nonce;
        this.hash = hash;
        this.previousBlockHash = previousBlockHash;
        this.blockValidator = blockValidator
        this.reputation = reputation
    }

    
}
module.exports = Block;