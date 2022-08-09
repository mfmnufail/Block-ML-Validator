const express = require("express");
const bodyParser = require("body-parser");
const { v4 } = require("uuid");
const Blockchain = require("./blockchain");
const { default: axios } = require("axios");
const port = process.env.PORT;
const BlockchainUtils = require("../Utils/BlockchainUtils");
const Wallet = require("../Wallet/index");
const wallet = new Wallet();
const TrainDatasetPool = require("../Wallet/train-dataset-pool");
const trainDatasetPool = new TrainDatasetPool();
const TestDatasetPool = require("../Wallet/test-dataset-pool");
const testDatasetPool = new TestDatasetPool();
const ModelPool = require("../Wallet/model-pool");
const modelPool = new ModelPool();
const FavouriteModel = require("../Wallet/favouritModel");
const favouriteModel = new FavouriteModel({ publickey: wallet.getPublickey() });
const FavouriteModelPool = require("../Wallet/favourite-model-pool");
const favouriteModelPool = new FavouriteModelPool();
const ContractPool = require("../Wallet/contract-pool");
const contractPool = new ContractPool();
const cors = require("cors");
const SmartContract = require("../SmartContract/tradeContract");
const {deploy} = require("../SmartContract/tradeContract")
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const nodeAddress = v4().split("_").join("");
const mlcoin = new Blockchain();
const pendingTransactions = mlcoin.pendingTransactions;

const DEFAULT_PORT = 3005;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

function rpc(PORT, pubsub) {
  app.get("/", (req, res) => {
    res.send(mlcoin.currentNodeUrl);
  });

  app.get("/blockchain", (req, res) => {
    pubsub.broadcastChain();
    pubsub.broadcastTransaction();
    res.send(mlcoin);
  });

  app.get("/wallet", (req, res) => {
    res.send(wallet);
  });

  app.get("/model/pool", (req, res) => {
    res.send(modelPool.getMap());
  });

  app.get("/train/pool", (req, res) => {
    res.send(trainDatasetPool.getMap());
  });

  app.get("/test/pool", (req, res) => {
    res.send(testDatasetPool.getMap());
  });

  app.get("/favmodel/pool", (req, res) => {
    res.send(favouriteModelPool.getMap());
  });

  app.get("/contract/pool", (req, res) => {
    res.send(contractPool.getMap());
  });

  app.post("/transaction", (req, res) => {
    const newTransaction = req.body;
    const blockIndex =
      mlcoin.addTransactionToPendingTransactions(newTransaction);

    res.json({ note: `Transaction will be added in the block ${blockIndex}.` });
  });

  app.post("/contract", async(req, res) => {

    contractDetails = await deploy({MNEMONIC:req.body.MNEMONIC,account:req.body.account,
    biddingTime:req.body.biddingTime,blockHash:req.body.blockHash,ipfsHash:req.body.ipfsHash
    })


    mlcoin.addContractToPendingContractTransactions(contractDetails)
    contractPool.setModelTransaction(contractPool)
    pubsub.broadcastTransaction(contractDetails);
    res.send(contractDetails)
    // res.json({ note: `Transaction will be added in the block ${blockIndex}.` });
  });

  app.post("/data/train", (req, res) => {
    transaction = wallet.createTrainDatasetTransaction({
      datasetAddress: req.body.datasetAddress,
      description: req.body.description,
      flag: req.body.flag,
      chain: mlcoin,
    });

    console.log(
      "The train dataset transaction " +
        JSON.stringify(transaction.getModelDetails())
    );

    trainDatasetPool.setTrainDatasetTransaction(transaction);
    const blockIndex = mlcoin.addTrainDataTransactionToPendingDataTransactions(
      transaction.getModelDetails()
    );
    pubsub.broadcastTransaction(transaction.getModelDetails());
    res.json({
      note: `Training dataset will be added in the block ${blockIndex}.`,
    });
  });

  app.post("/data/test", (req, res) => {
    transaction = wallet.createTestDatasetTransaction({
      trainDatasetAddress: req.body.trainDatasetAddress,
      testDatasetAddress: req.body.testDatasetAddress,
      description: req.body.description,
      flag: req.body.flag,
      trainTransaction: mlcoin.pendingTrainDataTransactions,
      chain: mlcoin,
    });

    console.log(
      "The test dataset transaction " +
        JSON.stringify(transaction.getModelDetails())
    );

    testDatasetPool.setTestDatasetTransaction(transaction);
    const blockIndex = mlcoin.addTestDataTransactionToPendingDataTransactions(
      transaction.getModelDetails()
    );
    pubsub.broadcastTransaction(transaction.getModelDetails());
    const reputationRating = {
      publickey: transaction.getModelDetails().senderwallet,
      reputation: transaction.getModelDetails().reputation,
    };
    mlcoin.addReputationRating(reputationRating);

    console.log("The reputation rating " + JSON.stringify(reputationRating))
    pubsub.broadcastTransaction(reputationRating);
    res.json({
      note: `Training dataset will be added in the block ${blockIndex}.`,
    });
  });

  app.post("/model", (req, res) => {
    transaction = wallet.createModelTransaction({
      datasetAddress: req.body.datasetAddress,
      modelAddress: req.body.modelAddress,
      flag: req.body.flag,
      trainTransaction: mlcoin.pendingTrainDataTransactions,
    });

    console.log(
      "The model dataset transaction " +
        JSON.stringify(transaction.getModelDetails())
    );

    console.log("the data transaction >>>>" + transaction);
    modelPool.setModelTransaction(transaction);

    pubsub.broadcastTransaction(transaction);
    res.json({ note: `Model will be added to the model pool.` });
  });

  app.post("/favmodel", (req, res) => {
    favouriteModel.addFavouritModel({
      datasetAddress: req.body.datasetAddress,
      modelAddress: req.body.modelAddress,
      performance: req.body.performance,
      flag: req.body.flag,
    });

    console.log(
      "The favourite model dataset transaction " +
        JSON.stringify(favouriteModel.getModelDetails())
    );

    favouriteModelPool.setFavouriteModelTransaction(favouriteModel);

    pubsub.broadcastTransaction(favouriteModel);

    required = favouriteModelPool.validatingRequired();

    console.log("The required validation " + required);

    if (required) {
      mlcoin.addModelTransactionToPendingModelTransactions(favouriteModelPool.validModelList())
      favouriteModelPool.clear()
      pubsub.broadcastTransaction({clearModel:"yes"})
      pubsub.createNewBlock();
      // favouriteModelPool.clear()
    }

    res.json({ note: `Model will be added to the model pool.` });
  });

  app.post("/transaction/broadcast", (req, res) => {
    const newTransaction = mlcoin.createNewTransaction(
      req.body.amount,
      req.body.sender,
      req.body.recipient
    );

    mlcoin.addTransactionToPendingTransactions(newTransaction);
    pubsub.broadcastTransaction(newTransaction);

    res.json({ note: "Transaction created and broadcast successfully " });
  });

  app.get("/consensus", function (req, res) {
    const requestPromises = [];
    mlcoin.networkNodes.forEach((networkNodeUrl) => {
      const requestOptions = axios.get(networkNodeUrl + "/blockchain");

      requestPromises.push(requestOptions);
    });

    Promise.all(requestPromises).then((blockchains) => {
      const currentChainLength = mlcoin.chain.length;
      let maxChainLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransactions = null;

      console.log("The length goes here...", blockchains);

      blockchains.forEach((blockchain) => {
        if (blockchain.data.chain.length > maxChainLength) {
          maxChainLength = blockchain.data.chain.length;
          newLongestChain = blockchain.data.chain;
          newPendingTransactions = blockchain.data.pendingTransactions;
        }
      });

      if (
        !newLongestChain ||
        (newLongestChain && !mlcoin.chainIsValid(newLongestChain))
      ) {
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

  app.listen(4000, () => {
    console.log(`listening at localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
      console.log(`The differennt port from default: ${PORT}`);
    }
  });
}

module.exports = { rpc, mlcoin, wallet, modelPool, favouriteModelPool,contractPool };
