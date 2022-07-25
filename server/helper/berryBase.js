require('dotenv').config()
const axios = require("axios")
const fs = require("fs")


let watchedProducts = require("../data/cron/watchedProducts.json");

module.exports = {
    execute: async function (){
        console.group("[BerryBase]: execute started")
        this.getProductData()
    },
    getProductData: async function(channel_id) {
        let o = []
        await axios.get(`https://www.berrybase.de/PixupExcludeItems/listingReload?${this.generateParams()}`)
        .then(res => {
            console.log(`[BerryBase]: listingReload call status ${res.data.success}`)
            watchedProducts = this.checkAvailable(res.data.templates)
            fs.writeFileSync("./server/data/cron/watchedProducts.json", JSON.stringify(watchedProducts, null, 4))
            
        })
        .catch(e => {
            console.log(`[BerryBase]: Error ${e.toString()}`)
            o = []
        })

        return o
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
    }
}