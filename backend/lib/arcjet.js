import arcjet,{tokenBucket,shield,detectBot} from "@arcjet/node";

import "dotenv/config";

//init arcjet

export const aj=arcjet({
    key:process.env.ARCJET_KEY,
    characteristics:process.env.ARCJET_KEY,
    rules:[
        // shield protects your application from common attacks . e.g . SQL injection ,XSS and CSRF attacks
        shield({mode:"LIVE"}),
        detectBot({
            mode:"LIVE",
            // block all bot except search engines,
            allow:[
                "CATEGORY:SEARCH_ENGINE",
                // see the full list at https://arcjet.com/bot-list
            ]
        }),
        //rate limiting 
        tokenBucket({
            mode:'LIVE',
            refillRate:5,
            interval:10,
            capacity:10
        }),
    ],
}); 


