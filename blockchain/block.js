class Block {


    constructor({index,transactions,nonce,hash,previousBlockHash}){
        this.index = index;
        this.timstamp = Date.now();
        this.transactions = transactions;
        this.nonce = nonce;
        this.hash = hash;
        this.previousBlockHash = previousBlockHash;
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