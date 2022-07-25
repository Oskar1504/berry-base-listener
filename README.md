# berry-base-listener
This is a small Cron application which checks every 30 minutes if specific products available in the [BerryBase Shop](https://www.berrybase.de/). If product status changed you can receive Discord/Telegram chat notifications.

A small express API also running where you can request and add more products to watchlist.

there is already a running version. If u want access hit me up on discord: Oskar#2843

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
    - also new productData gets compared with old data and if status changed productListeners gets notified via DiscordWebhook and/or Telegram Bot chat
- the /api router (express.js) now reads/write data to watchedProducts.json

## Discord/Telegram notifier
*Get added to running script*
- hit me up on discord and i'll add your credentials to the running script
- Oskar#2843

*Self host*
- to get notified via Discord webhook or telegram u need to add the Weebhook/chat id token to the .env
- after that u need to edit ./server/data/cron/productListeners.json and add which token listens to which Product sku

## how to use
- clone repo
- create .env using .env-template
- remove mainapiconnector from package.json
    - only used in personal enviroment to connect to main api gateway
- edit ./server/data/cron/watchedProducts.json to specify which product skus to listen to
- npm i
- npm run start

## Todo
- discord webhook implementation | added
- twitter bot implementation
- telegram bot implementation | added
- /api/addProduct query sanitatsion
- email sending script
- webhook notifictaion sender 
    - just axios to different urls 

