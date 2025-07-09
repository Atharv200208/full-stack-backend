import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";

const getAllVideos = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    let filter = {}

    if(query){
        filter.$or = [
            {
                title:{
                    $regex: query, 
                    $options:"i",
                }
            },
            {
                description:{
                    $regex: query,
                    $options: "i",
                }
            },
        ]
    }

    const skip = (page - 1) * limit // = x,  skips the first x documents and shows the next docs with page limit 10
    const sortOptions = {}

    if(sortBy && sortType){
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1; // -1 is desc and 1 is asc and sortBy is the field like createdAt, title
    }

    const videos = await Video.find(filter)
    .populate("owner", "username fullName avatar")
    .sort(sortOptions)
    .skip(parseInt(skip))
    .limit(parseInt(limit))

    const total = await Video.countDocuments(filter)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
            videos, 
            total,
            page : Number(page),
            totalPages : Math.ceil(total/limit),
        }, //.ceil() will round of the value to the nearest number so at the end even when a page has less than 10 videos it will be counted as a page  
            "All videos fetched successfully"
        ) 
    )
})

const publishAVideo = asyncHandler(async(req, res) => {
    const { title, description } = req.body

    if(!title){
        throw new ApiError(400, "Title is required")
    }

    const videoFile = req.files?.video?.[0]?.path

    if(!videoFile){
        throw new ApiError(400, "Video file is required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile, "video")

    if(!uploadedVideo || !uploadedVideo.url){
        throw new ApiError(400, "The video file is necessary")
    }

    const video = await Video.create({
        title, 
        description,
        videoUrl: uploadedVideo.url,
        owner: req.user._id
})

    const populatedVideo = await Video.findById(video._id).populate(
        "owner",
        "username fullName avatar"
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            populatedVideo,
            "Video was successfully published"
        )
    )

})

const updateVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    
    const thumbnailFile = req.files?.thumbnail?.[0]?.path
    let uploadedThumbnail
    if(thumbnailFile){
        uploadedThumbnail  = await uploadOnCloudinary(thumbnailFile)
        if (uploadedThumbnail?.url) {
            thumbnailUrl = uploadedThumbnail.url
        }
    }
    
    const video = await Video.findOne({
        _id : videoId,
        owner : req.user._id, 
    })
    
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    let thumbnailUrl = video.thumbnail

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title: title ?? video.title,
                description: description ?? video.description,
                thumbnail: thumbnailUrl,
            }
        }, 
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video details updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }


    const video = await Video.findOne(
        {
            _id: videoId,
            owner: req.user._id,
        }
    )

    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    await Video.deleteOne(
        {
            _id: videoId,
            owner: req.user._id,
        }
    )

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Video deleted successfully"
        )
    )

})

const togglePublishStatus = asyncHandler(async(req,res) => {
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

    const video = await Video.findOne(
        {
            _id: videoId,
            owner: req.user._id,
        }
    )

    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            `Video is now ${video.isPublished ? "published" : "unpublished"}`
        )
    )
})

export { 
    getAllVideos,
    publishAVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}