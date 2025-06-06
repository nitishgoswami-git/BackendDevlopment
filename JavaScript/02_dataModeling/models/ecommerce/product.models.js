import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    desc :{
        type: String,
        required : true
    },
    name : {
        type: String,
        required: true
    },
    productImage: {
        type: String 
    },
    price: {
        type: Number,
        default : 0,
    },
    stock:{
        default: 0,
        type: Number
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Category",
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps: true})


export const Product = mongoose.model("Product",productSchema)