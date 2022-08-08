// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract SimpleAuction {
    address payable public beneficiary;
    uint public auctionEndTime;

    //current state of auction
    address public highestBidder;
    uint highestBid;

    //Allowed widrawals of previous bid
    mapping (address=>uint) pendingReturns;

    //set to true at the end disallows any change
    //by default initialized to false
    bool ended;

    //event that will be emitted on changes
    event highestBidIncreased(address bidder,uint amount);
    event auctionEnded(address winner, uint amount);

    //triple slash comment called natspec comment
    //will be shown user asked to confirm the transaction

    ///The auction is already ended
    error AuctionAlreadyEnded();

    ///There is already a higher or equal bid
    error BidNotHighEnough(uint highestBid );

    ///The auction has not ended yet
    error AuctionNotYetEnded( );

    ///The function auctionEnd has already been called
    error AuctionEndAlreadyCalled( );    
    
    constructor(
        uint biddingTime,
        address payable beneficiaryAddress
    ) {
        beneficiary = beneficiaryAddress;
        auctionEndTime = block.timestamp + biddingTime;
    }

//the value will refund,if is not won
    function bid() external payable{
        if(block.timestamp > auctionEndTime)
            revert AuctionAlreadyEnded();
        
        if(msg.value <= highestBid)
            revert BidNotHighEnough(highestBid);

        if (highestBid !=0){
            pendingReturns[highestBidder] += highestBid;
        
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit highestBidIncreased(msg.sender, msg.value);
    }

    ///Widraw a bid that was overbid
    function widraw() external returns(bool){
        uint amount = pendingReturns[msg.sender];
        if(amount>0){
            pendingReturns[msg.sender] = 0;
        
        if(!payable(msg.sender).send(amount)){
            pendingReturns[msg.sender]= amount;
            return false;
         }
        
        }
        return true;
    }

    function auction() external{
        //condition
        if(block.timestamp< auctionEndTime)
            revert AuctionNotYetEnded();
        if(ended)
            revert AuctionEndAlreadyCalled();
        
        //effects
        ended = true;
        emit auctionEnded(highestBidder, highestBid);

        //interaction
        beneficiary.transfer(highestBid);


    }

}
