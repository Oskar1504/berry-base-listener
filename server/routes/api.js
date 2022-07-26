const express = require('express')
const fs = require('fs');
const berryBase = require('../helper/berryBase');
const { sanitizeRequest } = require('../helper/requestSanitizer');

const router = express.Router();


const DATA_FILE = "./server/data/cron/watchedProducts.json"
const PRODUCT_DATA_FILE = "./server/data/cron/productData.json"
const PRODUCT_LISTENERS_FILE = "./server/data/cron/productListeners.json"

// used when compiling the routes in the MainAPiConnector
router["custom"] = {}
router.custom["parent_path"] = "/api"
router.custom["routes"] = {
    "get":{
        "/": "info about this router",
        "/getProductList": "receive all watchedProducts",
        "/getProduct?product=RPI-PICO-W": "receive stock status off specfific product SKU",
        "/addProductToList?product=RPI-PICO": "add Product sku to watchedProducts",
    },
    "post":{}
}


router.get('/',async (req, res, next) => {
    try{
        res.json({
            data:{
                message:"available routes",
                routes: router.custom.routes
            }, 
            status:200
        })

    }catch(e){
        console.log(e.toString())
        res.json({message: e.toString(), status:500})
    }
});

router.get('/getProductList',async (req, res, next) => {
    try{
        res.json({
            data: JSON.parse(fs.readFileSync(DATA_FILE)),
            status:200
        })
    }catch(e){
        console.log(e.toString())
        res.json({message: e.toString(), status:500})
    }
});

router.get('/getProduct',async (req, res, next) => {
    try{
        let query = sanitizeRequest(req, {
            query:[{
                key: "product",
                required: true,
                default: "default",
                regex: /^[A-Za-z0-9-_]*$/
            }]
        })
        console.log(query)
        let productList = JSON.parse(fs.readFileSync(DATA_FILE))
        res.json({
            data: productList[req.query.product],
            status:200
        })
    }catch(e){
        console.log(e.toString())
        res.json({message: e.toString(), status:500})
    }
});

router.get('/addProductToList',async (req, res, next) => {
    try{
        let query = sanitizeRequest(req, {
            query:[
                {
                    key: "product",
                    required: true,
                    default: "default",
                    regex: /^[A-Za-z0-9-_]*$/
                },
                {
                    key: "name",
                    required: true,
                    default: "default",
                    regex: /^[A-Za-z0-9-_ ]*$/
                },
                {
                    key: "url",
                    required: true,
                    default: "default",
                    regex: /^[A-Za-z0-9-_\/.:]*$/
                }
            ]
        }).query
        console.log(query)

        let productList = JSON.parse(fs.readFileSync(DATA_FILE))
        let productDataList = JSON.parse(fs.readFileSync(PRODUCT_DATA_FILE))
        let productListeners = JSON.parse(fs.readFileSync(PRODUCT_LISTENERS_FILE))

        Object.values(productListeners).forEach(application => {
            application[query.product] = []
        })

        productList[query.product] = "not scanned"
        productDataList[query.product] = {
            sku: query.product,
            name: query.name,
            url: query.url
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(productList, null, 4))
        fs.writeFileSync(DATA_FILE, JSON.stringify(productList, null, 4))
        fs.writeFileSync(PRODUCT_LISTENERS_FILE, JSON.stringify(productListeners, null, 4))

        res.json({
            data: `Added ${query.product} to watchedProducts list. Will be scanned in the next 30min`,
            status:200
        })
    }catch(e){
        console.log(e.toString())
        res.json({message: e.toString(), status:500})
    }
});

router.get('/forceScan',async (req, res, next) => {
    try{
        berryBase.getProductData()
        res.json({
            data: "forced scan",
            status:200
        })
    }catch(e){
        console.log(e.toString())
        res.json({message: e.toString(), status:500})
    }
});

module.exports = router;