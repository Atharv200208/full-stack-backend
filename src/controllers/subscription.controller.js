import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription  } from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const toggleSubscription = asyncHandler(async(req, res) => {
    const { channelId } = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if(String(req.user._id) === channelId){
        throw new ApiError(400,"You cannot subscribe to your ow channel")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    })

    let message;
    if(existingSubscription){
        //Unsubcsribe
        await Subscription.deleteOne();
        message = "Unsubscribed from the channel"
    }
    else{
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        message = "Subscribed to the channel"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            message
        )
    )
})

const getUserChannelSubscriber = asyncHandler(async(req, res) => {
        const { channelId } = req.params
        
        if(!channelId){
            throw new ApiError(404, "Channel ID not found")
        }


} )

export {
    toggleSubscription,
    getUserChannelSubscriber,
}