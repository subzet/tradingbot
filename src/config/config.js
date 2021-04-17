require('dotenv').config();

const config = new Map()

const BASE_DELAY = 30000 //30 seconds

config.set('API_KEY',process.env.API_KEY)
config.set('API_SECRET',process.env.API_SECRET)

config.set('DELAY_MAP',{
    //For every timeframe returns a suitable delay in ms for trader to wait before getting data again.
    '1m': BASE_DELAY,
    '5m': BASE_DELAY * 5,
    '15m': BASE_DELAY * 15,
    '30m': BASE_DELAY * 30,
    '1h': BASE_DELAY * 60,
    '1d': BASE_DELAY * 60 * 24
})

config.set('chainUrl','https://bsc-dataseed1.binance.org:443')

config.set('routerContractAddress','0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F')

module.exports = config;

