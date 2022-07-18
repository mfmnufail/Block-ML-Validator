const ReputationStake = require('./reputationStake')
// import ReputationStake from './reputationStake'

const pos = new ReputationStake();

pos.update("bob",100);
pos.update("alice",100);
pos.update("john",100);

bobwins = 0;
alicewins = 0;

for(i in Array.from({length: 100}, (x, i) => i)){
    forger = pos.validator(randomString(i))
    if(forger === "bob")
        bobwins+= 1
    else if(forger === "alice")
        alicewins+=1
}
console.log("Bob wins " + bobwins + " times")
console.log("Alice wins " + alicewins + " times")

console.log(pos.stakers)
console.log(pos.get("bob"))
console.log(pos.get("alice"))
console.log(pos.get("john"))


function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }