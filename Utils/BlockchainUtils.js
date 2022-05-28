const sha256 = require('sha256');


class BlockchainUtils{

    static hashBlock(previousBlockHash,currentBlockData,nonce){
        const dataString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataString);
        return hash;
      }
}

module.exports = BlockchainUtils;