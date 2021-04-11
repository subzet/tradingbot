require('dotenv').config();

const config = new Map()

config.set('API_KEY',process.env.API_KEY)
config.set('API_SECRET',process.env.API_SECRET)


module.exports = config;

