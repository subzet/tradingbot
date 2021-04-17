//Token Handler
const Web3 = require('web3')
const BEP20_ABI = require("../config/BEP20_ABI.json");
const Router_ABI = require("../config/Router_ABI.json");
const Token = require('../services/token')
const config = require('../config/config')

const web3 = new Web3(config.get('chainUrl'));
const routerContract = new web3.eth.Contract(Router_ABI, config.get('routerContractAddress'));

//Represents storage (?)
const tokens = []

const getTokenContract = async (contractAddress) => {
    var contract = new web3.eth.Contract(BEP20_ABI, contractAddress);

    if (!contract) throw new Error("Error contract not found");

    return contract;
}

const getTokenBySymbol = (symbol) => {
    const token = tokens.filter(token => token.symbol === symbol)
    
    if (token.length > 0) return token[0]

    return undefined
}

const addToken = async (contractAddress) => {
    try{
        const contract = await getTokenContract(contractAddress)

        const token = {
            name: await contract.methods.name().call({}),
            symbol: await contract.methods.symbol().call({}),
            contractAddress,
            token:new Token(contract,routerContract, undefined)
        }

        tokens.push(token)

        return {code: 200, msg: `${token.symbol} added succesfully`}
    }catch(error){
        return {code:404, msg: error.message}
    }
}

const getBalance = async (symbol,walletAddress) => {
    const token = getTokenBySymbol(symbol)

    if(token){
        const balance = await token.token.getTokenBalance(walletAddress)
        return {code:200, balance}
    }

    return {code:404, msg: "Did not found token, add it first."}   
}

const startTracking = async (symbol,timeframe) => {
    const token = getTokenBySymbol(symbol)

    if(token){
        token.token.startTracking()
        return {code:200, msg: "Token started tracking price"}
    }

    return {code:404, msg: "Did not found token, add it first."}    
}

const stopTracking = async (symbol) => {
    const token = getTokenBySymbol(symbol)

    if(token){
        if(token.token.running){
            token.token.stopTracking()
            return {code:200, msg: "Token stopped tracking price"}
        }else{
            return {code:400, msg: "Token was not running"}
        }
    }

    return {code:404, msg: "Did not found token, add it first."}
}

module.exports = {addToken, getBalance, startTracking, stopTracking}
