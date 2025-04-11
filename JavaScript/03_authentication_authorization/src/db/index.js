import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected successfully`)
    }catch(e){
        console.log(`Something went wrong ${e}`)
        process.exit(1)
    }
}
export {connectDB}