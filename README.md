# berry-base-listener
This is a small Cron application which checks every 30 minutes if specific products available in the [BerryBase Shop](https://www.berrybase.de/).

A small express API also running where you can request and add more products to watchlist.

## Routes
```
<HOST_URL>/api
```
```json
"get":{
        "/": "info about this router",
        "/getProductList": "receive all watchedProducts",
        "/getProduct?product=RPI-PICO-W": "receive stock status off specfific product SKU",
        "/addProductToList?product=RPI-PICO": "add Product sku to watchedProducts",
    },
    "post":{}
```
## Workflow
- npm run start = node server/server.js
- server.js starts an express.js https server with the api router
- server.js also starts an cron job which runs n:00 and n:30 24/7
    - this cron job reqeusts a route with all product skus specified in ./server/data/cron/watchedProducts.json
    - when request succes it parses the response .
        - when "warenkorb" button availalbe it "knows" it is available otherwise it is not available
    - the parsed reqest gets sotred into watchedproducts.json
- the /api router (express.js) now reads/write data to watchedProducts.json

## Todo
- discord webhook implementation
- twitter bot implementation
- telegram bot implementation
- /api/addProduct query sanitatsion
