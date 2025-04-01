import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js"
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config(); // Load environment variables from a.env file

const PORT = process.env.PORT || 3000;



const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet()); // helmet is a security middleware that helps you to protect your app by setting various HTTP headers

app.use(morgan("dev")); // morgan is a logging middleware that helps you to log requests to the console

// apply arcjet rate-limit to all routes
app.use(async(req,resizeBy,next)=>{
    try {
        const decision=await aj.protect(req,{
            requested:1 // specify each request consumes 1 token
        })
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                res.status(429).json({error:"Too many requests"});
            }else if(decision.reason.isBot()){
                res.status(403).json({error:"Bot access denied"})
            }else{
                res.status(403).json({error:"Forbidden"})
            }
            return;
        }

        // check for spoofed bots
        if(decision.results.some((result)=>result.reason.isBot() && result.reason.isSpoofed())){
            res.status(403).json({error:"Spoof bot detected"});
        }
        next();
    } catch (error) {
        console.log("Arcjet Error",error);
        next(error);
    }
})


app.use("/api/products", productRoutes);

async function initDB() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})