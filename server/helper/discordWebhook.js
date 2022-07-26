require('dotenv').config()
const axios = require("axios")


module.exports = {
    execute() {
        console.log("telegram would send a message")
    },
    sendMessage(webhook_id, message){
        // possible cotent https://discord.com/developers/docs/resources/channel#create-message
        let messageObj = JSON.stringify({
            content: message
        })
        
        this.sendRequest(webhook_id, messageObj)
    },
    sendEmbed(webhook_id, message, url, fields = [], color = 0xcd3c65){
        this.sendRequest(webhook_id, JSON.stringify({
            "content": "",
            "embeds": [
                {
                    "type": "rich",
                    "title": `Berry Base listener`,
                    "description": `${message}`,
                    "color": 0xcd3c65,
                    "fields": fields.map(f => {
                        return {
                            name: f.name,
                            value: f.value,
                            inline: true
                        }
                    }),
                    "timestamp": new Date().toISOString(),
                    "footer": {
                        "text": `berry-base-listener`
                    },
                    "url":url
                }
            ]
        }))
    },
    sendRequest(webhook_id, messageObj){
        
        if(process.env.DEV_MODE != "PROD" && process.env.DEV_MODE != "DEV_SENDMESSAGE"){
            console.log(`[DISCORD]: No message send due to DEV_MODE != PROD`)
            return
        }

        //due to the fact sometimes some keys arent given i catch this error
        if(process.env[webhook_id]){  
            axios.post(`https://discord.com/api/webhooks/${process.env[webhook_id]}`, messageObj, {
                headers: {
                'Content-Type': 'application/json'
                }
            })
            .then(res => {
                console.log(`[DISCORD]: webhook call success ${webhook_id}`)
            })
            .catch(e => {
                console.log(`[DISCORD]: Error ${e.toString()}`)
            })
        }else{
            console.log(`[DISCORD]: ERROR webhook_id not defined in .env`)
        }
    }
        
};