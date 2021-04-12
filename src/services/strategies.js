var _ = require('lodash')

const strategies = {
    buy_up_trend: (data) => {
        //Strategy config
        const short = 3
        const medium = 13
        const large = 99
        
        if (data.length < 100){
            console.log("Not enough data to make a decision")
            return {condition:false, latestTick: undefined}
        }

        //data is supposed to be an array of timeframed ticks in ascendent with this
        //keys: time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored
        const parsedData = _.drop(_.reverse(data.map(tick => (tick.close))))

        //Calculate indicators
        const moving_average_short = parsedData.slice(0,short).reduce((sum, price) => (sum + parseFloat(price)),0) / short + 1 
        const moving_average_medium = parsedData.slice(0,medium).reduce((sum, price) => (sum + parseFloat(price)),0) / medium + 1
        const moving_average_large = parsedData.slice(0,large).reduce((sum, price) => (sum + parseFloat(price)),0) / large + 1

        console.log(`Last Price: ${parsedData[0]}Short: ${moving_average_short}, Medium: ${moving_average_medium}, Large: ${moving_average_large}`)
        const condition = moving_average_short >= moving_average_medium && moving_average_medium >= moving_average_large

        return {condition, latestTick: data[data.length - 1]}
    }
}


const apply = (strategy, data) => {
    if(strategies[strategy] == undefined) throw new Error("Not a valid strategy!")
    return strategies[strategy](data)
}

module.exports = {apply}