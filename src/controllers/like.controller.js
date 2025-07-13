import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404, "Video ID was not found")
    }

    const existingLike = await Like.findOne({
        user: req.user._id,
        video: videoId,
    })
    
    let message
    if (existingLike) {
        await Like.deleteOne({
        user: req.user._id,
        video: videoId,
        });
        message = "The video is now removed from your liked videos"
    }else{
        await Like.create({
            user: req.user._id,
            video: videoId
        }),
        message = "This video is now added to your liked videos"
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

const toggleTweetLike = asyncHandler(async(req, res) => {
    const { tweetId } = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(404, "The tweet was not found")
    }

    const existingLike = await Like.findOne({
        user: req.user._id,
        tweet: tweetId
    })

    let message
    if (existingLike) {
        await Like.deleteOne({
        user: req.user._id,
        tweet: tweetId,
        });
        message = "The tweet is now removed from your liked tweets"
    }else{
        await Like.create({
            user: req.user._id,
            tweet: tweetId,
        });
        message = "This tweet is now added to your liked tweets"
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

const toggleCommentLike = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(404, "The tweet was not found")
    }

    const existingLike = await Like.findOne({
        user: req.user._id,
        comment: commentId
    })

    let message
    if (existingLike) {
        await Like.deleteOne({
        user: req.user._id,
        comment: commentId,
        });
        message = "The comment is now unliked"
    }else{
        await Like.create({
            user: req.user._id,
            comment: commentId,
        });
        message = "This comment is liked"
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

const getLikedVideos  = asyncHandler(async(req, res) =>{
    const pageNmber = parseInt(req.query.page) || 1
    const limitNumber = parseInt(req.query.page) || 10
    const skip = (pageNmber - 1) * limitNumber
    
    const likedVideos = await Like.find({
        user: req.user._id,
        video:{
            $exists : true
        }
    })
    .populate({
        path: "video",
        populate:{ path: "owner", select:"fullName username avatar"}
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean() // the lean function improves the performance by using plain js objects

    const videos = likedVideos
            .map(like => like.video)
            .filter(video => video !== null)
    
    const total = await Like.countDocuments({
        user: req.user._id,
        video:{
            $exists: true
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
            total,
            videos,
            page: pageNmber,
            totalPages: Math.ceil(total/limit)
            },
            "All the liked videos were fetched successfully"
        )
    )

})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos,
}