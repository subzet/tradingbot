const moment = require('moment')
const config = require('../config/config')

class TokenPair{
    //Token Pair Service enables token price tracking & alert setting functionality 

    constructor(contract, routerContract, referenceToken){
        this.contract = contract; //Already instanciated contract Address
        this.routerContract = routerContract; //Already instanciated router contract.
        this.referenceToken = referenceToken //Address from token which we want to getPrice. Example BUSD contract (0xBLABLABLA)
        this.tokenPrice = undefined //Token last price {price: 12312, timestamp: date}
        this.alerts = [] //User defined Alerts.
        this.timeframe = undefined //Timeframe for tracking price.
        this.tracking = false; //State Variable which indicates token is tracking it's price.
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async startTracking(){
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


    async refreshPrice(tokenTo, amount){
      //Price depends on amount desired to trade ?
      const currentPrice = this.routerContract.methods
      .getAmountsOut(amount, [this.contractAddress, this.referenceToken])
      .call({});
    
      this.tokenPrice = {
          timestamp: moment().format(),
          price: currentPrice
      }
    }

    async getTokenBalance(address){
        return await this.contract.methods.balanceOf(address).call({});
    }
}

module.exports = TokenPair



