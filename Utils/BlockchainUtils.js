const sha256 = require('sha256');


class BlockchainUtils{

    static hashBlock(previousBlockHash,currentBlockData,validator){
        const dataString = previousBlockHash + validator + JSON.stringify(currentBlockData);
        const hash = sha256(dataString);
        return hash;
      }
}

module.exports = BlockchainUtils;