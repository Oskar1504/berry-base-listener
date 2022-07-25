require('dotenv').config()
const axios = require("axios")
const fs = require("fs")

const telegramBot = require("../helper/telegramBot")
const discordWebhook = require("../helper/discordWebhook")

let watchedProducts = require("../data/cron/watchedProducts.json");
let productListeners = require("../data/cron/productListeners.json");

module.exports = {
    execute: async function (){
        console.group("[BerryBase]: execute started")
        if(process.env.DEV_MODE == "PROD"){

            this.getProductData()
        }else{
            console.log("no fetching due wron dev mode")
            console.log("Using test data to tet send modules")
            let newAvail = JSON.parse(JSON.stringify(watchedProducts))
            newAvail["D1-RELS"] = "not scanned"
            this.checkProductStatusChanges(newAvail)
        }
        console.groupEnd()
    },
    getProductData: async function() {
        await axios.get(`https://www.berrybase.de/PixupExcludeItems/listingReload?${this.generateParams()}`)
        .then(res => {
            console.log(`[BerryBase]: listingReload call status ${res.data.success}`)
            let newAvail = this.checkAvailable(res.data.templates)

            this.checkProductStatusChanges(newAvail)

            watchedProducts = newAvail
            fs.writeFileSync("./server/data/cron/watchedProducts.json", JSON.stringify(watchedProducts, null, 4))
            
        })
        .catch(e => {
            console.log(`[BerryBase]: Error ${e.toString()}`)
        })
    },
    checkProductStatusChanges: function(productData){
        Object.entries(watchedProducts).forEach(keyVal => {
            if(keyVal[1] != productData[keyVal[0]] && keyVal[1] != "not scanned"){
                let message = `${keyVal[0]} changed status from "${keyVal[1]}" to "${productData[keyVal[0]]}"`
                console.log(message)
                this.productStatusChanged(keyVal, message)
            }
        })
    },
    generateParams: function(){
        let o = ""
        Object.keys(watchedProducts).forEach(product =>{
            o += `numbers[]=${product}&`
        })
        return o
    },
    checkAvailable: function(templates){
        return Object.fromEntries(Object.entries(templates).map(keyVal => {
            if(keyVal[1].includes('data-add-article="true"')){
                keyVal[1] = "available"
            }else{
                keyVal[1] = "not available"
            }
            return keyVal
        }))
    },
    productStatusChanged: function(productKeyVal, message = "Error empty message"){
        let parsedSku = `\n\nParsed SKU try:\n ${productKeyVal[0]} ~ ${this.parseSku(productKeyVal[0])}`

        productListeners.telegram[productKeyVal[0]].forEach(chat_id => {
            let withHeader = "*Berry Base Product listener* \n\n" + message + parsedSku
            telegramBot.sendMessage(chat_id, withHeader)
        })

        productListeners.discord[productKeyVal[0]].forEach(chat_id => {
            let withHeader = "**Berry Base Product listener** \n\n" + message + parsedSku
            discordWebhook.sendMessage(chat_id, withHeader)
        })
    },
    parseSku: function(sku){
        let o = ""
        let abk = {
            "RPIZ": "Raspberry Pi Zero",
            "RPI": "Raspberry Pi",
            "RELS": "Relais",
            "BP": "B Plus",
        }
        sku.split("-").forEach(teil => {
            Object.keys(abk).forEach(ab =>{
                if(teil.includes(ab)){
                    teil = teil.replace(ab, "")
                    o += abk[ab]
                }
            })

            if(teil.includes("GB")){
                o +=" " + teil + " "
            }else{
                o += " " + teil + " "
            }
        })
        o = o.replace(/\s\s+/g, ' ')
        return o
    }
}