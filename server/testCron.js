
const berryBase = require("./helper/berryBase")
let HTMLParser = require('node-html-parser');
const axios = require("axios")
const fs = require("fs")

let watchedProducts = require("./data/cron/watchedProducts.json");


let skus = ["RPI-PICO-W", "RPI-PICO", "RPI4B-4GB", "D1-RELS", "RPIZ-13", "RPI1-BP", "RPIZ-2W"]
skus = []
skus.forEach(sku => {
    console.log(berryBase.parseSku(sku))
})

berryBase.execute()

function generateProductData(overwrite = false){
    console.log("generatirn producctlistdata")
    // generate product data for emtpy prodcut keys

    let productDataList = require("./data/cron/productData.json");

    Object.keys(watchedProducts).forEach(p => {
        if(!productDataList[p] || overwrite){
            productDataList[p] = {
                sku: p,
                name: berryBase.parseSku(p),
                url: "https://www.berrybase.de"
            }
        }
    })

    fs.writeFileSync("./data/cron/productData.json", JSON.stringify(productDataList, null, 4))
}


function urlTest(){
    Object.keys(watchedProducts).forEach(sku => {
        console.log(berryBase.generateUrl(sku))
    })
}


async function urlScrap(){
    await axios.get(`https://www.berrybase.de/PixupExcludeItems/listingReload?numbers[]=RPI-PICO-W&numbers[]=RPI-PICO`)
        .then(res => {
            console.log(`[BerryBase]: listingReload call status ${res.data.success}`)
            Object.values(res.data.templates).forEach(template => {
                let root = HTMLParser.parse(template);
                let as = [...root.querySelectorAll("a.not--available")]
                if(as.length >= 1){
                    console.log(as[0].rawAttributes.href)
                }
            })
            
        })
        .catch(e => {
            console.log(`[BerryBase]: Error ${e.toString()}`)
        })
}