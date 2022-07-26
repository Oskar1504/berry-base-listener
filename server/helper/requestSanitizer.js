const { query } = require("express")

module.exports = {
    sanitizeRequest: function (req, config){
        let keys = Object.keys(config)
        let o = {}
        keys.forEach(key => {
            let input = req[key]
            let allowedQuery = config[key]
            o[key] = {}
    
            allowedQuery.forEach(queryParam => {
                let inQueryParam = input[queryParam.key]
                if(queryParam.required && inQueryParam === undefined){
                    throw `Query parameter ${queryParam.key} is required`
                }
                else if(!queryParam.regex.test(input[queryParam.key])){
                    throw `Query parameter ${queryParam.key} contains invalid chars`
                }
                else{
                    if(inQueryParam === undefined){
                        o[key][queryParam.key] = queryParam.default
                    }else{
                        o[key][queryParam.key] = input[queryParam.key]
                    }
                }
                
            })
        })
    
        return o
    }
}