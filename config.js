const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 4;

const GENESIS_DATA = {
  nonce: 0,
  hash: '',
  previouseBlockHash:'',
  
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = { address: '*authorized-reward*' };

const MINING_REWARD = 50;

module.exports = {
  GENESIS_DATA: GENESIS_DATA,
  MINE_RATE,
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD
};
