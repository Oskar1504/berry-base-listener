require('dotenv').config()
const axios = require("axios")

// telegram chat ids
// fini 788066174   oskar 270034072   hanna     1243440750      daniel 1442631291

module.exports = {
    execute() {
        console.log("telegram would send a message")
    },
    sendMessage(chat_id, message){
        if(process.env.DEV_MODE != "PROD" && process.env.DEV_MODE != "DEV_SENDMESSAGE"){
            console.log(`[TELEGRAM]: No message send due to DEV_MODE != PROD`)
            return
        }
        if(process.env[chat_id]){
            axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                params: {
                    chat_id: process.env[chat_id],
                    text: message,
                    parse_mode: "Markdown"
                },
            })
            .then(res => {
                console.log(`[TELEGRAM]: /sendMessage to ${chat_id}`)
            })
            .catch(e => {
                console.log(`[TELEGRAM]: ERROR ${e.toString()}`)
            })
        }else{
            console.log(`[TELEGRAM]: ERROR chat_id not defined in .env`)
        }
    }
};