const express = require("express");
const bodyParser = require("body-parser");
const { v4 } = require("uuid");
const Blockchain = require("./blockchain");
const { default: axios } = require("axios");
const port = process.argv[2];

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const nodeAddress = v4().split("_").join("");
const mlcoin = new Blockchain();

app.get("/", (req, res) => {
  res.send(mlcoin.currentNodeUrl);
});

app.get("/blockchain", (req, res) => {
  res.send(mlcoin);
});

app.post("/transaction", (req, res) => {
  const newTransaction = req.body;
  const blockIndex = mlcoin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in the block ${blockIndex}.` });
});

app.post("/transaction/broadcast", (req, res) => {
  const newTransaction = mlcoin.createNewTransaction(
    req.amount,
    req.sender,
    req.recipient
  );
  
  mlcoin.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  mlcoin.networkNodes.forEach((networkNodeUrl) => {
    const reqpromise = axios.post(
      networkNodeUrl + "/transaction",
      newTransaction
    );

    requestPromises.push(reqpromise);
  });

  Promise.all(requestPromises)
  .then((data) => {
    res.json({ note: "Transaction created and broadcast successfully " });
  });
});

// register a node and broadcast it the network
app.post("/register-and-broadcast-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (mlcoin.networkNodes.indexOf(newNodeUrl) == -1)
    mlcoin.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];

  mlcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = axios.post(networkNodeUrl + "/register-node", {
      newNodeUrl: newNodeUrl,
    });

    regNodesPromises.push(requestOptions);
  });

  Promise.all(regNodesPromises)

    .then((data) => {
      const bulkRegisterOptions = axios.post(
        newNodeUrl + "/register-nodes-bulk",
        { allNetworkNodes: [...mlcoin.networkNodes, mlcoin.currentNodeUrl] }
      );

      return bulkRegisterOptions;
    })

    .then((data) => {
      res.json({ note: "New node registered with network successfully." });
    });
});

app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = mlcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = mlcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode)
    mlcoin.networkNodes.push(newNodeUrl);
  res.json({ note: "New node registered successfully." });
});

app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      mlcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = mlcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
      mlcoin.networkNodes.push(networkNodeUrl);
  });

  res.json({ note: "Bulk registration successful." });
});


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
  const hash = mlcoin.hashBlock(
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
    res.json({
      note: "New block mined & broadcast successfully",
      block: newBlock,
    });
  });
    
});


app.post("/receive-new-block", function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = mlcoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

  if (correctHash && correctIndex) {
    mlcoin.chain.push(newBlock);
    mlcoin.pendingTransactions = [];
    res.json({
      note: "New block received and accepted.",
      newBlock: newBlock,
    });
  } else {
    res.json({
      note: "New block rejected.",
      newBlock: newBlock,
    });
  }
});




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


app.listen(port, function () {
  console.log(`Listening on port ${port}...`);
});
