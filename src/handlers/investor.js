const binance = require('./binance')
const strategies = require('../services/strategies')

const shouldInvest = async (strategy, pair, timeframe) => {
    const { candlesticks, code } = await binance.getPairCandles(pair,timeframe)
    
    if(code === 500){
        return {code, msg: "Problem with getting prices"}
    }

    const result = strategies.apply(strategy,candlesticks)

    return {code: 200, result}
}


module.exports = {shouldInvest}