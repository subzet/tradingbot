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

module.exports = {sendMessage}