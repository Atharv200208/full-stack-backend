import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose, { mongo } from "mongoose";

const createTweet = asyncHandler(async(req, res) => {
    const { content } = req.body

    if(!content || content.trim() === ''){
       throw new ApiError(400, "There should be some content to post")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    const populatedTweet = await Tweet.findById(tweet._id)
    .populate("owner","fullName username avatar")

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            populatedTweet,
            "The Tweet was created successfully"
        )
    )
})

const getUserTweet = asyncHandler(async(req, res) => {
    const { ownerId } = req.params

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        throw new ApiError(400, "Invalid owner ID");
    }

    const userTweet = await Tweet.find({
        owner: ownerId
    })
    .populate("owner", "fullName username avatar")
    .sort({ createdAt: -1 }) //will sort the tweet from the newest to oldest

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userTweet,
            "The user tweets were fetched successfully"
        )
    )

})

const updateUserTweet = asyncHandler(async(req, res) => {
    const { tweetID } = req.params
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(tweetID)) {
        throw new ApiError(404, "The tweet ID invalid")
    }

    if (!content || content.trim() === '') {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const tweet = await Tweet.findOne({
        _id: tweetID,
        owner : req.user._id,
    })

    if (!tweet) {
        throw new ApiError(404, "The tweet was not found")
    }

    tweet.content = content
    await tweet.save()

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "The tweet has been updated successfully"
        )
    )

})

const deleteUserTweet = asyncHandler(async(req, res) => {
    const { tweetID } = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetID)){
        throw new ApiError(404, "The tweet was not found")
    }

    const tweet = await Tweet.findOne({
        _id: tweetID,
        owner: req.user._id,
    })

    if(!tweet) {
        throw new ApiError(404, "The tweet was not found")
    }

    await Tweet.deleteOne({
        _id: tweetID,
        owner: req.user._id,
    })

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "The tweet was deleted successfully"
        )
    )

})

export {
    createTweet,
    getUserTweet,
    updateUserTweet,
    deleteUserTweet,
}