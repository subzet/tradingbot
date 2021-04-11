const binance = require('../handlers/binance')
const strategies = require('../services/strategies')
const config = require('../config/config')

class Trader{
    constructor(initialBalance, strategy, timeframe, pair) {
        this.balance = initialBalance
        this.strategy = strategy
        this.timeframe = timeframe
        this.pair = pair
        this.running = false
        this.evaluations = []
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async start(){
        console.log("Starting trader...")
        this.running = true

        while(this.running){
            try{
                console.log(`Getting data from Binance for pair ${this.pair} and timeframe ${this.timeframe}`)
                const result = await this.shouldInvest(this.strategy,this.pair,this.timeframe)
                console.log(`Strategy is in ${result ? 'true' : 'false'} zone..`)

                this.evaluations.push(result)

                if(this.evaluations.length > 1){
                    const currentEvaluation = this.evaluations[this.evaluations.length - 1]
                    const lastEvaluation = this.evaluations[this.evaluations.length - 2]

                    if(currentEvaluation && !lastEvaluation){
                        console.log("BUY SIGNAL!!")
                    }

                    if(!currentEvaluation && lastEvaluation){
                        console.log("SELL SIGNAL!!")
                    }
                }
            }catch(error){
                console.log(error.message)
            }

            await this.sleep(config.get("DELAY_MAP")[this.timeframe])
        } 
    }

    async shouldInvest (strategy, pair, timeframe) {
        const { candlesticks, code } = await binance.getPairCandles(pair,timeframe)
        
        if(code === 500){
            throw new Error("Error getting candles!!!")
        }
    
        const result = strategies.apply(strategy,candlesticks)
    
        return result
    }

    stop(){
        console.log("Stopping trader...")
        this.running = false
    }


}

module.exports = Trader