const {ec, verifySignature, cryptoHash } = require('../Utils')
const Lot = require('./Lot')
const {wallet} = require('../blockchain/networkNode')


class ReputationStake{

    constructor(){
        this.stakers = {"bob":1}
        this.setGenesisNodeStake()

    }

    clear(){
        this.stakers={}
    }

     setGenesisNodeStake(){
        let genesisPublicKey = "bob";
        console.log("The public key " + genesisPublicKey)
        this.stakers[genesisPublicKey] = 1
     }

    update(publicKeyString, stake){
        if (publicKeyString in this.stakers){
            this.stakers[publicKeyString] += stake
        }else{
            this.stakers[publicKeyString] = stake

        }
    }

     get(publicKeyString){
        if (publicKeyString in this.stakers){
            return this.stakers[publicKeyString]
        }else{
            return null
        }
    }

     


     winnerLot(lots, seed){
        let winnerLot = null
        let leastOffset = null
        
        let referenceHashIntValue = parseInt(cryptoHash(seed),16);
        for (let i=0; i<lots.length; ++i){
           let lotIntValue = parseInt(lots[i].lotHash(),16)
           let  offset = Math.abs(lotIntValue - referenceHashIntValue)
            if (leastOffset === null || offset < leastOffset){
                leastOffset = offset
                winnerLot = lots[i]
            }
        }
        return winnerLot
    }

     validator(lastBlockHash){
       let lots = this.validatorLots(lastBlockHash)
        let winnerLot = this.winnerLot(lots, lastBlockHash)
        console.log("Winner Lot" + JSON.stringify(winnerLot))
        return winnerLot.publicKey
     }

     validatorLots(seed){
        let lots = []
        for (let validator in this.stakers){
            for (let stake in Array.from({length: this.get(validator)}, (x, i) => i)){
                lots.push(new Lot(validator, stake+1, seed))
            }
        }
        return lots
    }
}

 module.exports = ReputationStake