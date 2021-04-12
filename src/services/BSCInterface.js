const Web3 = require("web3");
const BEP20_ABI = require("../config/BEP20_ABI.json");
const Router_ABI = require("../config/Router_ABI.json");

class BSCInterface {
  constructor(chainUrl, routerContractAddress, privateKey) {
    this.chainUrl = chainUrl;
    this.routerContractAddress = routerContractAddress;
    this.privateKey = privateKey;

    this.web3 = new Web3(this.chainUrl);
    this.wallet = web3.eth.accounts.wallet.add(this.privateKey);
    this.router = new web3.eth.Contract(Router_ABI, config.RouterContract);
  }

  //Get a contract, to call it's functions stc
  async getContract(contractAddress, ABI) {
    var contract = new web3.eth.Contract(ABI, contractAddress);

    if (!contract) throw new Error("Error contract not found");

    return contract;
  }

  //Get a contract, then call the balanceOf method to ask for the wallet balance
  async getBalance(contractAddress, walletAddress) {
    var contract = await getContract(contractAddress, BEP20_ABI);
    return await contract.methods.balanceOf(walletAddress).call({});
  }

  //Get a contract, then call the approve method allow the Router to trade in our name
  async approve(contractAddress, amount) {
    var contract = await getContract(contractAddress, BEP20_ABI);

    return await contract.methods
      .approve(this.routerContractAddress, amount)
      .send({ from: this.wallet.address, gas: 285000 });
  }

  //Deposit BNB to it's wrapped BEP20 toke and get WBNB
  async wrapBNB(amount) {
    var contract = await getContract(
      "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      BEP20_ABI
    ); // this is the WBNB contract

    return await contract.methods.deposit().send({
      from: this.wallet.address,
      gas: 285000,
      value: amount,
    });
  }

  //Swap 'amount' of 'tokenFrom' for at least 'minOut' of 'tokenTo' on the router
  async swap(tokenFrom, tokenTo, amount, miniOut) {
    var sellContract = await this.RouterContract.methods
      .swapExactTokensForTokens(
        amount,
        miniOut,
        [tokenFrom, tokenTo],
        this.wallet.address, // my wallet
        Date.now() + 1000 * 60 * 10 // expire 10 minutes
      )
      .send({
        from: wallet,
        gas: "285000",
      });

    return sellContract;
  }

  //Get swap rate for 'amount' of 'tokenFrom' to 'tokenTo'
  async getPrice(amount, tokenFrom, tokenTo) {
    return await this.RouterContract.methods
      .getAmountsOut(amount, [tokenFrom, tokenTo])
      .call({});
  }
}

module.exports = BSCInterface;
