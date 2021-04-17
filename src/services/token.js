const moment = require('moment')
const config = require('../config/config')

class TokenPair{
    //Token Pair Service enables token price tracking & alert setting functionality 

    constructor(contract, routerContract, referenceToken){
        return (async () => {
            this.contract = contract; //Already instanciated contract Address
            this.routerContract = routerContract; //Already instanciated router contract.
            this.referenceToken = referenceToken ||  "0xe9e7cea3dedca5984780bafc599bd69add087d56", //Busd contract //Address from token which we want to getPrice. Example BUSD contract (0xBLABLABLA)
            this.price = undefined //Token last price {price: 12312, timestamp: date}
            this.alerts = [] //User defined Alerts.
            this.timeframe = undefined //Timeframe for tracking price.
            this.tracking = false; //State Variable which indicates token is tracking it's price.

            this.decimals = await contract.methods.decimals().call({})
            this.symbol = await contract.methods.symbol().call({})
            this.name = await contract.methods.name().call({})
            this.address = this.contract._address

            return this
        })();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async startTracking(timeframe){
        this.timeframe = timeframe

        //Refresh prices
        this.tracking = true

        while(this.tracking){
            await this.refreshPrice()

            await this.sleep(config.get("DELAY_MAP")[this.timeframe])
        }
    }

    stopTracking(){
        this.tracking = false
    }   


    async refreshPrice(){
      //Price depends on amount desired to trade ?
      const  price  = await this.routerContract.methods
      .getAmountsOut(1000000000, [
        this.address,
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //Wbnb contract
        this.referenceToken, //Busd contract
      ])
      .call({});
    
      this.price = {
          timestamp: moment().format(),
          value: price[2] / Math.pow(10, 9 + 18 - this.decimals)
      }
    }

    async getTokenBalance(address){
        return await this.contract.methods.balanceOf(address).call({});
    }
}

module.exports = TokenPair



