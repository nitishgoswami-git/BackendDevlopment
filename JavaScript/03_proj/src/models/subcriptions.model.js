import mongoose,{model, Schema} from "mongoose";

const subcriptionSchema = new Schema(
    {
        subcriber: {
            type: Schema.Types.ObjectId, //one who is subcribing
            ref: "User"
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref : "User"
        }

    },
    {
        timestamps: true
    }
)

export const Subcription = mongoose.model("Subcription", subcriptionSchema)