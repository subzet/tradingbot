const axios = require('axios')

const sendMessage = (text) => {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`
    const body = {
        text,
        chat_id: process.env.CHAT_ID
    }
    
    try{
        axios.post(url,body)
    }catch(error){
        console.log(error.message)
    }
}

const TelegramBot = require("node-telegram-bot-api");
    
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true})

module.exports = {sendMessage, bot}