
const Web3 = require('web3');
const web3 = new Web3("")

let provider_url ="https://ropsten.infura.io/v3/501f614a8a344b9d81f6561446bc3a85"

const w3 = web3.setProvider(provider_url)

class SmartContract{

     transmit_string_contract(){
        let abi = [{'inputs': [{'internalType': 'uint256', 'name': 'biddingTime', 'type': 'uint256'}, {'internalType': 'address payable', 'name': 'beneficiaryAddress', 'type': 'address'}], 'stateMutability': 'nonpayable', 'type': 'constructor'}, {'inputs': [], 'name': 'AuctionAlreadyEnded', 'type': 'error'}, {'inputs': [], 'name': 'AuctionEndAlreadyCalled', 'type': 'error'}, {'inputs': [], 'name': 'AuctionNotYetEnded', 'type': 'error'}, {'inputs': [{'internalType': 'uint256', 'name': 'highestBid', 'type': 'uint256'}], 'name': 'BidNotHighEnough', 'type': 'error'}, {'anonymous': False, 'inputs': [{'indexed': False, 'internalType': 'address', 'name': 'winner', 'type': 'address'}, {'indexed': False, 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'auctionEnded', 'type': 'event'}, {'anonymous': False, 'inputs': [{'indexed': False, 'internalType': 'address', 'name': 'bidder', 'type': 'address'}, {'indexed': False, 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256'}], 'name': 'highestBidIncreased', 'type': 'event'}, {'inputs': [], 'name': 'auction', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}, {'inputs': [], 'name': 'auctionEndTime', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [], 'name': 'beneficiary', 'outputs': [{'internalType': 'address payable', 'name': '', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [], 'name': 'bid', 'outputs': [], 'stateMutability': 'payable', 'type': 'function'}, {'inputs': [], 'name': 'highestBidder', 'outputs': [{'internalType': 'address', 'name': '', 'type': 'address'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [], 'name': 'widraw', 'outputs': [{'internalType': 'bool', 'name': '', 'type': 'bool'}], 'stateMutability': 'nonpayable', 'type': 'function'}]
        let bytecode = "608060405234801561001057600080fd5b506102be806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80636d4ce63c14610030575b600080fd5b61003861004e565b6040516100459190610196565b60405180910390f35b60606000600a67ffffffffffffffff81111561006d5761006c6101b8565b5b6040519080825280602002602001820160405280156100a057816020015b606081526020019060019003908161008b5790505b5090506040518060a001604052806072815260200161021760729139816000815181106100d0576100cf6101e7565b5b6020026020010181905250806000815181106100ef576100ee6101e7565b5b602002602001015191505090565b600081519050919050565b600082825260208201905092915050565b60005b8381101561013757808201518184015260208101905061011c565b83811115610146576000848401525b50505050565b6000601f19601f8301169050919050565b6000610168826100fd565b6101728185610108565b9350610182818560208601610119565b61018b8161014c565b840191505092915050565b600060208201905081810360008301526101b0818461015d565b905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfe232323232323232323232323233133373930363233353035353234343831333930333539373535313237313136383732323637393335343034333733353738353935363535393932353537303532313635393031353736323834393039373338363733393231323034383535363233393131a26469706673582212201b5a19aea5422829694017c31842983416b831d89cfb4217569cee3a5816b10a64736f6c634300080c0033"
        let randomString = w3.eth.contract(abi=abi,bytecode=bytecode)
    
        let ropsten_chain =3
        let wallet= "0xfFA5Ac27dC08fA6E4bD85fBBC89Ea63048E797aA"
        let nonce =w3.eth.getTransactionCount(wallet)
        let transaction  =randomString.constructor().buildTransaction(
            {
                "gasPrice": w3.eth.gas_price,
                "chainId" :ropsten_chain,
                "from" : wallet,
                "nonce" : nonce
            
            }
        )
        // #Transaction sign in using private key
        let private_key = "0x"+"ba45aab7e4c8a382a5726c57011f910cbe236866ec94856a6222ed99bed856e9"

        let signed_transaction = w3.eth.account.sign_transaction(transaction,private_key=private_key)
        let transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
       let  transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)

        let contract_instance = w3.eth.contract(address=transaction_receipt.contractAddress,abi=abi)
        let Transmit=contract_instance.functions.get().call()
        return Transmit

        }
    }

module.exports = SmartContract;


