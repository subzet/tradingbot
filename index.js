const cluster = require('cluster');
const express = require('express');
const binance = require('./src/handlers/binance')
const investor = require('./src/handlers/investor')
const app = express();


app.use(express.json());

if (cluster.isMaster) {
    app.get('/', function (req, res) {
        res.send('Hello World from node!');
      });

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

    app.get('/balance', async function(req,res){
        const response = await binance.getBalance(req.query.coin)
        res.status(response.code).send(response)
    })

    app.get('/investor', async function(req,res){
        const response = await investor.shouldInvest(req.query.strategy, req.query.pair, req.query.timeframe)
        res.status(response.code).send(response)
    })


    app.post('/investor/start', async function(req,res){
        const response = await investor.startInvestor(req.query.strategy, req.query.pair, req.query.timeframe)
        res.status(response.code).send(response)
    })

    app.post('/investor/stopAll', async function(req,res){
        const response = await investor.stopAll()
        res.status(response.code).send(response)
    })

    const server = app.listen(8080, function () {
        const port = server.address().port;
        console.log('TRADING APP listening at http://localhost:%s', port);
    });
}

