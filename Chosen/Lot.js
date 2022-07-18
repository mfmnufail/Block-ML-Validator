const {ec, verifySignature, cryptoHash } = require('../Utils')


class Lot{
    constructor(publicKey, iteration, lastBlockHash){
        this.publicKey = publicKey
        this.iteration = iteration
        this.lastBlockHash = lastBlockHash
    }

    lotHash(){
       let hashData = this.publicKey + this.lastBlockHash
        for (let j in Array.from({length: this.iteration}, (x, i) => i)){
            hashData = cryptoHash(hashData)
        }
        return hashData
    }
}

module.exports = Lot