const binance = require('../handlers/binance')
const strategies = require('../services/strategies')
const telegram = require('../utils/telegram')
const config = require('../config/config')
const moment = require('moment')

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
        telegram.sendMessage(`Bot started tracking prices for ${this.pair} at ${moment().format()}`)

        this.running = true

        while(this.running){
            try{
                console.log(`${moment().format()} Getting data from Binance for pair ${this.pair} and timeframe ${this.timeframe}`)
                const result = await this.shouldInvest(this.strategy,this.pair,this.timeframe)
                console.log(`Strategy is in ${result.condition ? 'true' : 'false'} zone.. ${JSON.stringify(result.latestTick)}`)
                
                //telegram.sendMessage(`Strategy is in ${result ? 'true' : 'false'} zone..`)

                this.evaluations.push(result)

                if(this.evaluations.length > 1){
                    const currentEvaluation = this.evaluations[this.evaluations.length - 1]
                    const lastEvaluation = this.evaluations[this.evaluations.length - 2]

                    if(currentEvaluation.condition && !lastEvaluation.condition){
                        const msg = `${moment().format()} Buy Signal for ${this.pair} at ${currentEvaluation.latestTick.close}`
                        console.log(msg)
                        telegram.sendMessage(msg)
                    }

                    if(!currentEvaluation.condition && lastEvaluation.condition){
                        const msg = `${moment().format()} Sell Signal for ${this.pair} at ${currentEvaluation.latestTick.close}`
                        console.log(msg)
                        telegram.sendMessage(msg)
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
        telegram.sendMessage(`Bot stopped tracking prices for ${this.pair} at ${moment().format()}`)
        this.running = false
    }


}

module.exports = Trader