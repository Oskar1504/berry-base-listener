require("dotenv").config()
var CronJob = require('cron').CronJob;
const fs = require('fs');
const express = require('express')

const berryBase = require("./helper/berryBase")

// extend console.log to write in log file
//https://javascript.plainenglish.io/lets-extend-console-log-8641bda035c3
var log = console.log;
console.log = function(){
    let args = Array.from(arguments)
    let fileArgs = JSON.parse(JSON.stringify(args))
    fileArgs.unshift(`[${new Date().toLocaleString()}]`)
    fs.appendFileSync("./server/logs/main.log", fileArgs.join(" | ") + "\n")
    log.apply(console, args);
}

var berryBaseJob = new CronJob(
	// '*/15 * * * * *',
	'0 0/30 * 1/1 * *',
	async function() {
        await berryBase.execute()
        afterExecute(this)
    },
	null,
	true,
	'Europe/Berlin'
);

function afterExecute(e){
    console.log(`[JOB SCHEDULE] berryBaseJob: ${e.nextDate().toString()}`)
}

console.log(`---------------Startup at ${new Date().toLocaleString()}---------------`)
console.log(`[JOB SCHEDULE] berryBaseJob: ${berryBaseJob.nextDate().toString()}`)

const apiRouter = require("./routes/api")

const app = express()

app.use(express.json())

app.use(function (req, res, next) {
    console.log(req.originalUrl)

    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers","Content-Type")
    res.header("'Content-Type', 'application/json'")
    next()
})


app.use("/api", apiRouter)

app.get('/', async function (req, res) {
    res.json({
        message: "im alive",
        status: 200
    })
})

app.listen(process.env.PORT, function () {
    console.log(`${process.env.PROJECT_NAME} is running at http://localhost:${process.env.PORT}`)
    MainAPiConnector.addApplication(app, process.env)
})