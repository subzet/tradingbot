const binance = require('./binance')
const strategies = require('../services/strategies')
const Trader = require('../services/trader')

const tradersRunning = []

const shouldInvest = async (strategy, pair, timeframe) => {
    const { candlesticks, code } = await binance.getPairCandles(pair,timeframe)
    
    if(code === 500){
        return {code, msg: "Problem with getting prices"}
    }

    const result = strategies.apply(strategy,candlesticks)

    return result
}


const startInvestor = async(strategy, pair, timeframe) => {
    const trader = new Trader(100000, strategy,timeframe,pair)
    trader.start()
    tradersRunning.push(trader)
    return {code:200, msg: "Trader started!!"}
}

const stopAll = async() => {

    tradersRunning.forEach(trader => {
        trader.stop()
    })

    return {code:200, msg: "Trader started!!"}
}

module.exports = {shouldInvest, startInvestor, stopAll}