const Gaming = artifacts.require('./Gaming.sol');

contract('Gaming', async (accounts) => {
  let gaming;
  const owner = accounts[0];
  const player1 = accounts[1];

  before(async () => {
    gaming = await Gaming.deployed();

    // Fund the contract directly from the owner account
    await web3.eth.sendTransaction({
      from: owner,
      to: gaming.address,
      value: web3.utils.toWei('10', 'ether')
    });
  });

  it('Should record player losses', async () => {
    const initialBalance = await web3.eth.getBalance(player1);
    const initialBalanceInEther = Number(web3.utils.fromWei(initialBalance, 'ether'));

    await gaming.winOrLose(10, true, web3.utils.toWei('1', 'ether'), {
      from: player1,
      value: web3.utils.toWei('1', 'ether')
    });

    const postBalance = await web3.eth.getBalance(player1);
    const postBalanceInEther = Number(web3.utils.fromWei(postBalance, 'ether'));

    const playerStats = await gaming.players(player1);

    assert.equal(playerStats.losses.toNumber(), 1, 'The player should have 1 loss');
    assert.isAtLeast(
      initialBalanceInEther,
      postBalanceInEther + 1,
      'Player account should have decreased by the amount of the wager'
    );
  });

  it('Should record player wins', async () => {
    await gaming.winOrLose(1, true, web3.utils.toWei('1', 'ether'), {
      from: player1,
      value: web3.utils.toWei('1', 'ether')
    });

    const playerStats = await gaming.players(player1);
    assert.equal(playerStats.wins.toNumber(), 1, 'The player should have 1 win');
  });

  it('Should withdraw funds', async () => {
    const initialBalance = await web3.eth.getBalance(owner);
    const initialBalanceInEther = Number(web3.utils.fromWei(initialBalance, 'ether'));

    const initialContractBalance = await web3.eth.getBalance(gaming.address);
    const initialContractInEther = Number(web3.utils.fromWei(initialContractBalance, 'ether'));

    console.log(`Owner balance is ${initialBalanceInEther} and contract balance is ${initialContractInEther}`);

    await gaming.withdrawFunds({ from: owner });

    const postBalance = await web3.eth.getBalance(owner);
    const postBalanceInEther = Number(web3.utils.fromWei(postBalance, 'ether'));

    const postContractBalance = await web3.eth.getBalance(gaming.address);
    const postContractInEther = Number(web3.utils.fromWei(postContractBalance, 'ether'));

    console.log(`Owner balance is ${postBalanceInEther} and contract balance is ${postContractInEther}`);

    assert.isAtLeast(
      postBalanceInEther - initialBalanceInEther,
      initialContractInEther - 0.1,
      'Contract funds should have transferred to the owner'
    );
  });
});

