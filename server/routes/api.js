const { query } = require('express');
const express = require('express')
const fs = require('fs')

const router = express.Router();

const DATA_FILE = "./server/data/cron/watchedProducts.json"

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
        console.log(req.query)
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
        console.log(req.query)
        let productList = JSON.parse(fs.readFileSync(DATA_FILE))
        productList[req.query.product] = "not scanned"
        fs.writeFileSync(DATA_FILE, JSON.stringify(productList, null, 4))
        res.json({
            data: `Added ${req.query.product} to watchedProducts list. Will be scanned in the next 30min`,
            status:200
        })
    }catch(e){
        console.log(e.toString())
        res.json({message: e.toString(), status:500})
    }
});

module.exports = router;