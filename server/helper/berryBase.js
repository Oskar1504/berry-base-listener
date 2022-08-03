require('dotenv').config()
const axios = require("axios")
const fs = require("fs")
let HTMLParser = require('node-html-parser');

const telegramBot = require("../helper/telegramBot")
const discordWebhook = require("../helper/discordWebhook")

const WATCHED_PRODUCTS_FILE = "./server/data/cron/watchedProducts.json"
const PRODUCT_DATA_FILE = "./server/data/cron/productData.json"
const PRODUCT_LISTENERS_FILE = "./server/data/cron/productListeners.json"

module.exports = {
    watchedProducts: function(){return JSON.parse(fs.readFileSync(WATCHED_PRODUCTS_FILE))},
    productListeners: function(){return JSON.parse(fs.readFileSync(PRODUCT_LISTENERS_FILE))},
    productDataList: function(){return JSON.parse(fs.readFileSync(PRODUCT_DATA_FILE))},
    execute: async function (){
        console.group("[BerryBase]: execute started")
        if(process.env.DEV_MODE == "PROD"){

            this.getProductData()
        }else{
            console.log("no fetching due wron dev mode")
            console.log("Using test data to tet send modules")
            let newAvail = JSON.parse(JSON.stringify(this.watchedProducts()))
            newAvail["D1-RELS"] = "not scanned"
            this.checkProductStatusChanges(newAvail)
        }
        console.groupEnd()
    },
    getProductData: async function() {
        let watchedProducts = this.watchedProducts()
        let productDataList = this.productDataList()
        await axios.get(`https://www.berrybase.de/PixupExcludeItems/listingReload?${this.generateParams()}`)
        .then(res => {
            console.log(`[BerryBase]: listingReload call status ${res.data.success}`)
            let newAvail = this.checkAvailable(res.data.templates)

            this.checkProductStatusChanges(newAvail)

            watchedProducts = newAvail
            fs.writeFileSync("./server/data/cron/watchedProducts.json", JSON.stringify(watchedProducts, null, 4))
            fs.writeFileSync("./server/data/cron/productData.json", JSON.stringify(productDataList, null, 4))
            
        })
        .catch(e => {
            console.log(`[BerryBase]: Error ${e.toString()}`)
        })
    },
    checkProductStatusChanges: function(productData){
        let watchedProducts = this.watchedProducts()
        Object.entries(watchedProducts).forEach(keyVal => {
            if(keyVal[1] != productData[keyVal[0]] && keyVal[1] != "not scanned"){
                console.log(`${keyVal[0]} changed status from "${keyVal[1]}" to "${productData[keyVal[0]]}"`)
                let product = {
                    sku: keyVal[0],
                    oldStatus: keyVal[1],
                    newStatus: productData[keyVal[0]],
                    url: this.generateUrl(keyVal[0])
                }
                this.productStatusChanged(product)
            }
        })
    },
    generateParams: function(){
        let watchedProducts = this.watchedProducts()
        let o = ""
        Object.keys(watchedProducts).forEach(product =>{
            o += `numbers[]=${product}&`
        })
        return o
    },
    checkAvailable: function(templates){
        let productDataList = this.productDataList()
        return Object.fromEntries(Object.entries(templates).map(keyVal => {

            let root = HTMLParser.parse(keyVal[1])
            let as = [...root.querySelectorAll("a.not--available")]
            if(as.length >= 1){
                keyVal[1] = "not available"
                productDataList[keyVal[0]].url = as[0].rawAttributes.href
            }else{
                keyVal[1] = "available"
            }
            return keyVal
        }))
    },
    productStatusChanged: function(product){
        let productListeners = this.productListeners()
        let parsedSku = `\n\n${product.sku} ~ ${this.parseSku(product.sku)}`
        let message = `${product.sku} changed from "${product.oldStatus}" to "${product.newStatus}"` 
        
        productListeners.telegram[product.sku].forEach(chat_id => {
            let withHeader = "*Berry Base Product listener* \n\n" 
                + message
                + parsedSku
            telegramBot.sendMessage(chat_id, withHeader)
        })

        productListeners.discord[product.sku].forEach(chat_id => {
            discordWebhook.sendEmbed(chat_id, message, product.url, [
                {
                    name: "Status old",
                    value: product.oldStatus
                },
                {
                    name: "Status new",
                    value: product.newStatus
                }
            ])
        })
    },
    parseSku: function(sku){
        let o = ""
        let abk = {
            "RPIZ": "Raspberry Pi Zero",
            "RPI": "Raspberry Pi",
            "RELS": "Relais",
            "BP": "B Plus",
            "BC": "BerryBase Club exclusive",
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
    },
    generateUrl: function(sku){
        let productDataList = this.productDataList()
        if(productDataList[sku]){
            return productDataList[sku].url
        }else{
            return "https://www.berrybase.de"
        }
    }
}