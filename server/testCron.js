
const berryBase = require("./helper/berryBase")



let skus = ["RPI-PICO-W", "RPI-PICO", "RPI4B-4GB", "D1-RELS", "RPIZ-13", "RPI1-BP", "RPIZ-2W"]

skus.forEach(sku => {

    console.log(berryBase.parseSku(sku))
})

berryBase.execute()