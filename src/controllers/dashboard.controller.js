import mongoose, { Model, model } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async(req, res) =>{
    const channelId = req.params.channelId

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(404, "Channel Id not found")
    }

    const channelObjectId = mongoose.Types.ObjectId(channelId)

    const now = new Date()
    const startOfThisMonth =new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfThisMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23, 59, 59, 999
    )

    const [
        totalSubscribers,
        totalVideos,
        viewsAgg,
        likesAgg,
        newSubscribersThisMonth,
    ] = await Promise.all([
        
        Subscription.countDocuments({ channel: channelObjectId }),

        Video.countDocuments({ owner: channelObjectId }),

        Video.aggregate([
            {
                $match: {
                    owner: channelObjectId
                }
            },
            {
                $group:{
                    _id:null,
                    total:{
                        $sum:"$viewCount"
                    }
                }
            },
        ]),

        Like.aggregate([
            {
                $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"_id",
                    as:"videoDoc"
                }
            },
            {
                $unwind:"videoDoc"
            },
            {
                $match: {
                    "videoDoc.owner": channelObjectId
                }
            },
            {
                $group:{
                    _id: null,
                    total:{
                        $sum:1
                    }
                }
            },
        ]),

        Subscription.countDocuments({
            channel: channelObjectId,
            createdAt:{
                $gte:startOfThisMonth,
                $lte:endOfThisMonth,
            }
        })
    ])

    const totalViews = viewsAgg[0]?.total || 0
    const totalLikes = likesAgg[0]?.total || 0

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalSubscribers,
                totalVideos,
                totalViews,
                totalLikes,
                newSubscribersThisMonth,
                averageViewPerVideo:
                totalVideos > 0 ? totalViews / totalVideos : 0
            },
            "Channel Stats Fetched Successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async(req, res) => {
    const channelId = req.params.channelId

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(404, "Channel Id not found")
    }

    const channelObjectId = mongoose.Types.ObjectId(channelId)

    const pageNumber = parseInt(req.query.page, 10) || 1
    const limitNumber = parseInt(req.query.limit, 10) || 1
    const skip = (pageNumber - 1) * limitNumber
    const sortBy = req.query.sortBy || "createdAt"
    const order = req.query.order === "asc" ? 1 : -1

    const [totalVideos, videos] = await Promise.all([
        Video.countDocuments({
            owner: channelObjectId,
            isPublic: true,
        }),
        Video.find({
            owner: channelObjectId,
            isPublic: true
        })
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limitNumber)
        .select("title description thumbnail viewCount createdAt")
        .lean()
    ])

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {totalVideos,
            page: pageNumber,
            pageSize: limitNumber,
            totalPages: Math.ceil(totalVideos / limitNumber),
            videos
            },
            "All Videos Fetched Successfully"
        )
    )
})

export { 
    getChannelStats,
    getChannelVideos,
}