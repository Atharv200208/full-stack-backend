import mongoose, { Schema } from "mongoose";
const subcriptionSchema = new Schema({
    subscriber:{
        type : Schema.Types.ObjectId, //One who is subscribing 
        ref: "User"
    },
    channel:{
         type : Schema.Types.ObjectId, //One whom we are subscribing 
        ref: "User"
    }
})



export const Subscription = mongoose.model("Subscription", subcriptionSchema);