const express = require("express");
const bodyParser = require("body-parser");
const { v4 } = require("uuid");
const Blockchain = require("./blockchain");
const { default: axios } = require("axios");
const port = process.env.PORT;
const BlockchainUtils = require("../Utils/BlockchainUtils")
const Wallet = require('../Wallet/index');
const wallet = new Wallet();
const TrainDatasetPool = require('../Wallet/train-dataset-pool')
const trainDatasetPool = new TrainDatasetPool();
const TestDatasetPool = require('../Wallet/test-dataset-pool')
const testDatasetPool = new TestDatasetPool();
const ModelPool = require('../Wallet/model-pool')
const modelPool = new ModelPool();
const FavouriteModel = require('../Wallet/favouritModel')
const favouriteModel = new FavouriteModel({publickey:wallet.getPublickey()});
const FavouriteModelPool = require('../Wallet/favourite-model-pool')
const favouriteModelPool = new FavouriteModelPool();
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}


const app = express();
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const nodeAddress = v4().split("_").join("");
const mlcoin = new Blockchain();
const pendingTransactions = mlcoin.pendingTransactions;


const DEFAULT_PORT = 3005;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;


function rpc(PORT,pubsub){

// setTimeout(()=> pubsub.broadcastChain(), 1000)
// setTimeout(()=> pubsub.broadcastTransaction(), 1000)


  app.get("/", (req, res) => {
    res.send(mlcoin.currentNodeUrl);
  });
  
  app.get("/blockchain", (req, res) => {
    pubsub.broadcastChain()
    pubsub.broadcastTransaction()
    res.send(mlcoin);
  });

  app.get("/wallet", (req, res) => {
    res.send(wallet);
  });


  app.get("/model/pool", (req,res)=>{
    res.send(modelPool.getMap())
  })

  app.get("/train/pool", (req,res)=>{
    res.send(trainDatasetPool.getMap())
  })

  app.get("/test/pool", (req,res)=>{
    res.send(testDatasetPool.getMap())
  })

  app.get("/favmodel/pool", (req,res)=>{
    res.send(favouriteModelPool.getMap())
  })
  
  app.post("/transaction", (req, res) => {
    const newTransaction = req.body;
    const blockIndex = mlcoin.addTransactionToPendingTransactions(newTransaction);

    res.json({ note: `Transaction will be added in the block ${blockIndex}.` });
  });

  app.post("/data/train", (req, res) => {

     transaction = wallet.createTrainDatasetTransaction(
      { datasetAddress:req.body.datasetAddress,
        description:req.body.description, 
        flag:req.body.flag, 
        chain:mlcoin
      })

    console.log("The train dataset transaction " + JSON.stringify(transaction.getModelDetails()))

    trainDatasetPool.setTrainDatasetTransaction(transaction);
    const blockIndex = mlcoin.addTrainDataTransactionToPendingDataTransactions(transaction.getModelDetails());
    pubsub.broadcastTransaction(transaction.getModelDetails())
    res.json({ note: `Training dataset will be added in the block ${blockIndex}.` });
  });

  app.post("/data/test", (req, res) => {
    
    transaction = wallet.createTestDatasetTransaction(
      { 
        trainDatasetAddress : req.body.trainDatasetAddress,
         testDatasetAddress : req.body.testDatasetAddress,
          description : req.body.description,
           flag : req.body.flag,
           trainTransaction: mlcoin.pendingTrainDataTransactions,
           chain:mlcoin
      })

    console.log("The test dataset transaction " + JSON.stringify(transaction.getModelDetails()))

    testDatasetPool.setTestDatasetTransaction(transaction);
    const blockIndex = mlcoin.addTestDataTransactionToPendingDataTransactions(transaction.getModelDetails());
    pubsub.broadcastTransaction(transaction.getModelDetails())
    const reputationRating = {
      publickey:transaction.getModelDetails().senderwallet,
      reputation:transaction.getModelDetails().reputation
    }
    mlcoin.addReputationRating(reputationRating)

    pubsub.broadcastTransaction(reputationRating)
    // pubsub.broadcastTransaction(mlcoin.reputation)
    res.json({ note: `Training dataset will be added in the block ${blockIndex}.` });
  });

  app.post("/model", (req, res) => {
       
    transaction = wallet.createModelTransaction(
      { 
        datasetAddress : req.body.datasetAddress,
        modelAddress : req.body.modelAddress,
        flag : req.body.flag,
        trainTransaction: mlcoin.pendingTrainDataTransactions
      })

    console.log("The model dataset transaction " + JSON.stringify(transaction.getModelDetails()))

    console.log("the data transaction >>>>" + transaction)
    modelPool.setModelTransaction(transaction);
    // const blockIndex = mlcoin.addModelTransactionToPendingModelTransactions(transaction.getModelDetails());
    pubsub.broadcastTransaction(transaction)
    res.json({ note: `Model will be added to the model pool.` });
  });

  app.post("/favmodel",(req,res)=>{
    favouriteModel.addFavouritModel(
      { 
        datasetAddress : req.body.datasetAddress,
        modelAddress : req.body.modelAddress,
        performance : req.body.performance,
        flag : req.body.flag
      })

    console.log("The favourite model dataset transaction " + JSON.stringify(favouriteModel.getModelDetails()))

    // console.log("the data transaction >>>>" + transaction)
    favouriteModelPool.setFavouriteModelTransaction(favouriteModel);
    // const blockIndex = mlcoin.addModelTransactionToPendingModelTransactions(transaction.getModelDetails());
    // details = {}
    // sets = []
    // sets[favouriteModel.getModelDetails().datasetAddress] = [favouriteModel.getModelDetails().models]

    // console.log("the favourite model details >>" + JSON.stringify(favouriteModel) )
    // details[wallet.getPublickey()] = {sets}
    pubsub.broadcastTransaction(favouriteModel)

    required = favouriteModelPool.validatingRequired()

    console.log("The required validation " + required)

    if(required){
      pubsub.createNewBlock()
    }

    // console.log("Favourite model details >>>>"+ JSON.stringify(details))
    res.json({ note: `Model will be added to the model pool.` });

  })


  


  
  app.post("/transaction/broadcast", (req, res) => {
    const newTransaction = mlcoin.createNewTransaction(
      req.body.amount,
      req.body.sender,
      req.body.recipient
    );
    
    mlcoin.addTransactionToPendingTransactions(newTransaction);
    pubsub.broadcastTransaction(newTransaction)
  
    // const requestPromises = [];
    // mlcoin.networkNodes.forEach((networkNodeUrl) => {
    //   const reqpromise = axios.post(
    //     networkNodeUrl + "/transaction",
    //     newTransaction
    //   );
  
    //   requestPromises.push(reqpromise);
    // });
  
    // Promise.all(requestPromises)
    // .then((data) => {
      // });
        res.json({ note: "Transaction created and broadcast successfully " });
  });
  
  // register a node and broadcast it the network
  // app.post("/register-and-broadcast-node", function (req, res) {
  //   const newNodeUrl = req.body.newNodeUrl;
  //   if (mlcoin.networkNodes.indexOf(newNodeUrl) == -1)
  //     mlcoin.networkNodes.push(newNodeUrl);
  
  //   const regNodesPromises = [];
  
  //   mlcoin.networkNodes.forEach((networkNodeUrl) => {
  //     const requestOptions = axios.post(networkNodeUrl + "/register-node", {
  //       newNodeUrl: newNodeUrl,
  //     });
  
  //     regNodesPromises.push(requestOptions);
  //   });
  
  //   Promise.all(regNodesPromises)
  
  //     .then((data) => {
  //       const bulkRegisterOptions = axios.post(
  //         newNodeUrl + "/register-nodes-bulk",
  //         { allNetworkNodes: [...mlcoin.networkNodes, mlcoin.currentNodeUrl] }
  //       );
  
  //       return bulkRegisterOptions;
  //     })
  
  //     .then((data) => {
  //       res.json({ note: "New node registered with network successfully." });
  //     });
  // });
  
  // app.post("/register-node", (req, res) => {
  //   const newNodeUrl = req.body.newNodeUrl;
  //   const nodeNotAlreadyPresent = mlcoin.networkNodes.indexOf(newNodeUrl) == -1;
  //   const notCurrentNode = mlcoin.currentNodeUrl !== newNodeUrl;
  //   if (nodeNotAlreadyPresent && notCurrentNode)
  //     mlcoin.networkNodes.push(newNodeUrl);
  //   res.json({ note: "New node registered successfully." });
  // });
  
  // app.post("/register-nodes-bulk", (req, res) => {
  //   const allNetworkNodes = req.body.allNetworkNodes;
  //   allNetworkNodes.forEach((networkNodeUrl) => {
  //     const nodeNotAlreadyPresent =
  //       mlcoin.networkNodes.indexOf(networkNodeUrl) == -1;
  //     const notCurrentNode = mlcoin.currentNodeUrl !== networkNodeUrl;
  //     if (nodeNotAlreadyPresent && notCurrentNode)
  //       mlcoin.networkNodes.push(networkNodeUrl);
  //   });
  
  //   res.json({ note: "Bulk registration successful." });
  // });
  
  
  app.get("/mine", function (req, res) {
  
    const lastBlock = mlcoin.getLastBlock();
    const previousBlockHash = lastBlock["hash"];
    const coinbase = mlcoin.createNewTransaction(6.25, "00", nodeAddress)
    mlcoin.addTransactionToPendingTransactions(coinbase)
    
    const currentBlockData = {
      transactions: mlcoin.pendingTransactions,
      index: lastBlock["index"] + 1,
    };
    const nonce = mlcoin.proofOfWork(previousBlockHash, currentBlockData);
    const hash = BlockchainUtils.hashBlock(
      previousBlockHash,
      currentBlockData,
      nonce
    );
  
    const newBlock = mlcoin.createNewBlock(nonce, hash, previousBlockHash);
  
    const requestPromise = [];
    mlcoin.networkNodes.forEach(networkNodeUrl=>{
      const requestOptions = axios.post(networkNodeUrl + "/receive-new-block", {newBlock : newBlock})
      requestPromise.push(requestOptions);
    })  
  
    Promise.all(requestPromise)
    .then((data) => {
  
      pubsub.broadcastChain();
  
      res.json({
        note: "New block mined & broadcast successfully",
        block: newBlock,
      });
    });
      
  });
  
  
  // app.post("/receive-new-block", function (req, res) {
  //   const newBlock = req.body.newBlock;
  //   const lastBlock = mlcoin.getLastBlock();
  //   const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  //   const correctIndex = lastBlock["index"] + 1 === newBlock["index"];
  
  //   if (correctHash && correctIndex) {
  //     mlcoin.chain.push(newBlock);
  //     mlcoin.pendingTransactions = [];
  //     res.json({
  //       note: "New block received and accepted.",
  //       newBlock: newBlock,
  //     });
  //   } else {
  //     res.json({
  //       note: "New block rejected.",
  //       newBlock: newBlock,
  //     });
  //   }
  // });
  
  
  
  
  app.get("/consensus", function (req, res) {
    const requestPromises = [];
    mlcoin.networkNodes.forEach((networkNodeUrl) => {
      
  
      const requestOptions = axios.get(networkNodeUrl + "/blockchain")
  
      requestPromises.push(requestOptions);
    });
  
    Promise.all(requestPromises).then((blockchains) => {
      const currentChainLength = mlcoin.chain.length;
      let maxChainLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransactions = null;
  
      console.log("The length goes here..." , blockchains)
      
      
      blockchains.forEach((blockchain) => {
        
  
  
        if (blockchain.data.chain.length > maxChainLength) {
          maxChainLength = blockchain.data.chain.length;
          newLongestChain = blockchain.data.chain;
          newPendingTransactions = blockchain.data.pendingTransactions;
        }
      });
  
      if (!newLongestChain ||(newLongestChain && !mlcoin.chainIsValid(newLongestChain))) {
        res.json({
          note: "Current chain has not been replaced.",
          chain: mlcoin.chain,
        });
      } else {
        mlcoin.chain = newLongestChain;
        mlcoin.pendingTransactions = newPendingTransactions;
        res.json({
          note: "This chain has been replaced.",
          chain: mlcoin.chain,
        });
      }
    });
  });
  
  
  let PEER_PORT;
  
  // if (process.env.GENERATE_PEER_PORT === 'true') {
  //   PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
  // }
  
  // const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
  app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
  
    // console.log(process.argv[0])
  
    if (PORT !== DEFAULT_PORT) {
      // syncWithRootState();
      console.log(`The differennt port from default: ${PORT}`)
    }
  });

}


module.exports = {rpc, mlcoin,wallet,modelPool,favouriteModelPool}





