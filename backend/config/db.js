import dotenv from "dotenv"
dotenv.config();

import mongoose from "mongoose"

export const connectDB =async ()=>{
    try {
        console.log("MONGO_URI =", process.env.MONGO_URI);
       await mongoose.connect(process.env.MONGO_URL);
        console.log("SUCCESSFULLY CONNECTED TO DB!");
    }catch(error){
        console.log("Error connecting DB:",error);
    }
}