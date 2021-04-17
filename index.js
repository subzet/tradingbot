const cluster = require('cluster');
const express = require('express');

const binance = require('./src/handlers/binance')
const investor = require('./src/handlers/investor')
const config = require('./src/config/config')

const token = require('./src/handlers/token')
const { bot } = require('./src/utils/telegram')

const app = express();




app.use(express.json());

if (cluster.isMaster) {
    app.get('/', function (req, res) {
        res.send('Hello World from node!');
      });


    //Spot interacts with Binance Exchange.
    app.get('/spot/:pair/price', async function(req,res){
        const response = await binance.getSpotPairPrice(req.params.pair)
        res.status(response.code).send(response)
    });

    app.get('/spot/:pair/history', async function(req,res){
        const response = await binance.getTradeHistory(req.params.pair)
        res.status(response.code).send(response)
    });

    app.get('/spot/:pair/candlesticks', async function(req,res){
        const response = await binance.getPairCandles(req.params.pair, req.query.timeframe)
        res.status(response.code).send(response)
    });

    app.get('/spot/balance', async function(req,res){
        const response = await binance.getBalance(req.query.coin)
        res.status(response.code).send(response)
    })

    app.get('/spot/investor', async function(req,res){
        const response = await investor.shouldInvest(req.query.strategy, req.query.pair, req.query.timeframe)
        res.status(response.code).send(response)
    })

    app.post('/spot/investor/start', async function(req,res){
        const response = await investor.startInvestor(req.query.strategy, req.query.pair, req.query.timeframe)
        res.status(response.code).send(response)
    })

    app.post('/spot/investor/stopAll', async function(req,res){
        const response = await investor.stopAll()
        res.status(response.code).send(response)
    })

    app.post('/spot/investor/backtest', async function (req,res){
        const response = await investor.backtest(req.query.strategy, req.query.pair, req.query.timeframe, req.query.initialBalance)
        res.status(response.code).send(response)
    })

    //BSC Interacts with blockchain
    app.post('/bsc/token', async function(req,res){
        if(!req.body.contract_address){
            res.status(404).send({msg:"Missing contract Address parameter in body"})
        }
        const response = await token.addToken(req.body.contract_address)

        res.status(response.code).send(response)
    })

    app.post('/bsc/token/track', async function(req,res){
        if(!req.body.token){
            res.status(404).send({msg:"Missing token parameter in body"})
        }
        const response = await token.startTracking(req.body.token, req.body.timeframe)

        res.status(response.code).send(response)
    })

    app.get('/bsc/token/balance', async function(req,res){
        if(!req.query.wallet){
            res.status(400).send({msg:"Missing wallet query param"})
        }

        const response = await token.getBalance(req.query.token,req.query.wallet)

        res.status(response.code).send(response)
    })

    app.get('/bsc/token/price', async function(req,res){
        if(!req.query.token){
            res.status(400).send({msg:"Missing token query param"})
        }

        const response = await token.getPrice(req.query.token)

        res.status(response.code).send(response)
    })

    //Telegram interface:
    bot.onText(/Hi/, (msg, match) => {
        bot.sendMessage(msg.chat.id,"Thanks for using binance bot!")
    })

    bot.onText(/Help/, (msg, match) => {
        bot.sendMessage(msg.chat.id,config.get('botTutorial'))
    })

    bot.onText(/\/add/, async (msg) => {
        const [,address] = msg.text.split(" ")
        const response = await token.addToken(address)

        bot.sendMessage(msg.chat.id, response.msg)
    })

    bot.onText(/\/track/, async (msg) => {
        const [,tkn,timeframe] = msg.text.split(" ")
        const response = await token.startTracking(tkn, timeframe)

        bot.sendMessage(msg.chat.id, response.msg)
    })

    bot.onText(/\/stop/, async (msg) => {
        const [,tkn] = msg.text.split(" ")
        const response = await token.stopTracking(tkn)

        bot.sendMessage(msg.chat.id, response.msg)
    })

    bot.onText(/\/balance/, async (msg) => {
        const [,tkn,wallet] = msg.text.split(" ")
        const response = await token.getBalance(tkn,wallet)

        bot.sendMessage(msg.chat.id, response.balance)
    })

    bot.onText(/\/price/, async (msg) => {
        const [,tkn] = msg.text.split(" ")
        const response = await token.getPrice(tkn)

        bot.sendMessage(msg.chat.id, JSON.stringify(response.price))
    })

    const server = app.listen(process.env.PORT || 8080, () => {
        const { port } = server.address();
        console.log('TRADING APP listening at http://localhost:%s', port);
    });
}

