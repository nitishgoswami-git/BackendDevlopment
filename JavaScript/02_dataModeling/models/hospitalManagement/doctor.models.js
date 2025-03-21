import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    salary:{
        type:String,
        required : true
    },
    qualification:{
        type:String,
        required: true
    },
    expirenceInYears:{
        type: Number,
        default: 0
    },
    worksInHospitals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital"
        }
    ],
    specialization:[
        {
            type: String
        }
    ]
},{timestamps:true})

export const Doctor = mongoose.model("Doctor",doctorSchema)