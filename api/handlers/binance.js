const Binance = require('node-binance-api');
const binance = new Binance()
const config = require('../config/config')


console.log("Initialiazing binance API...")
binance.options({ 'APIKEY': config.get('API_KEY'), 'APISECRET': config.get('API_SECRET'), 'reconnect': true });


const getSpotPairPrice = async (pair) => {
    try {
        const price = await binance.prices(pair)
        return {code: 200, pair, price}
    }catch(error){
        return {code:500, error: error.message}
    }
}

const getTradeHistory = async (pair) => {
    try {
        const history = await binance.trades(pair)
        return {code: 200, pair, history}
    }catch(error){
        return {code:500, error: error.message}
    }
}

const getPairCandles = async (pair, timeframe) => {
    try {
        // Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
        const candlesticks = await binance.candlesticks(pair,timeframe || '5m')
        
        //let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
        const parsedCandlesticks = candlesticks.map(tick => {
            const [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = tick;
            return {
                time,open,high,low,close,volume,closeTime,assetVolume,trades,buyBaseVolume,buyAssetVolume,ignored
            }
        })

        return {code: 200, pair, timeframe, candlesticks:parsedCandlesticks}
    }catch(error){
        return {code: 500, error: error.message}
    }
}

const getBalance = async(coin) => {
    try{
        const balance = await binance.balance()

        if(coin) return {code:200, balance:balance[coin]}
        
        return {code:200, balance}
    }catch(error){
        return {code: 500, error: error.message}
    }
}


module.exports = {
    getSpotPairPrice,
    getTradeHistory,
    getPairCandles,
    getBalance
}