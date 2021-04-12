const strategies = require('./strategies.js')


class Backtester{
    constructor(data,strategy,balance){
        this.data = data
        this.strategy = strategy 
        this.balance = balance
        this.initialBalance = balance
        this.evaluations = []
        this.longOrders = 0
        this.shortOrders = 0
        this.assetBalance = 0
    }

    start(){
        //Start from 0 to final data.
        for(var i = 0; i <= this.data.length; i++){
            const result = strategies.apply(this.strategy,this.data.slice(0,i))

            this.evaluations.push(result)

            if(this.evaluations.length > 1){
                const currentEvaluation = this.evaluations[this.evaluations.length - 1]
                const lastEvaluation = this.evaluations[this.evaluations.length - 2]

                if(currentEvaluation.condition && !lastEvaluation.condition){
                    console.log("Buy")
                    if(this.balance > 0){
                        const assetToBuy = this.balance/result.latestTick.close
                        this.balance = 0
                        this.assetBalance = assetToBuy
                        this.longOrders += 1
                    }
                }

                if(!currentEvaluation.condition && lastEvaluation.condition){
                    console.log("Sell")
                    if(this.assetBalance > 0) {
                        this.balance = this.assetBalance * result.latestTick.close
                        this.assetBalance = 0
                        this.shortOrders += 1
                    }
                }
            }
        }

        console.log(`Backtest for strategy ${this.strategy} finished`)
        console.log(`Used ${this.data.length} ticks for analysis`)
        console.log(`Bot made ${this.longOrders} long orders and ${this.shortOrders} short orders`)
        console.log(`Initial Balance: ${this.initialBalance} | Final Balance: ${this.balance} | Asset Balance: ${this.assetBalance.toString()} | Latest Asset Price: ${this.data[this.data.length - 1].close}`)
        
    }
}

module.exports = Backtester