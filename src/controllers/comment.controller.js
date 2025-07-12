import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    let filter = { video: videoId };

    if (query) {
        filter.content = { 
            $regex: query, $options: "i"
        }
    }

    const skip = (page - 1) * limit // = x,  skips the first x documents and shows the next docs with page limit 10
    const sortOptions = {}

    if(sortBy && sortType){
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1; // -1 is desc and 1 is asc and sortBy is the field like createdAt, title
    }

    const comments = await Comment.find(filter)
    .populate("owner", "fullName username avatar")
    .sort(sortOptions)
    .skip(parseInt(skip))
    .limit(parseInt(limit))

    const total = await Comment.countDocuments(filter)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,{
            comments,
            total,
            page: Number(page),
            totalPages: Math.ceil(total/limit)
            },
            "All comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async(req, res) => {
    const { videoId} = req.params
    const { content } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id,
    })

    if(!video){
        throw new ApiError(404, "The video does not exist")
    }

        if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

     const comment = await Comment.create({
        content, 
        video: videoId,
        owner: req.user._id
    })

    const populatedComment = await comment.populate("owner", "fullName username avatar")

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            populatedComment,
            `The comment was posted under the video ${videoId}`
        )
    )
})

const updateComment = asyncHandler(async(req, res) =>{
        const { videoId, commentId} = req.params
        const { content } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }

    const comment = await Comment.findOne({
        _id: commentId,
        owner: req.user._id,
        video: videoId
    })

    if(!comment){
        throw new ApiError(404, "The comment does not exist")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const updatedComment = await Comment.findByIdAndUpdate(        
        commentId,{

            $set:{
                content
            }
        }, {new:true}
    )

    const populatedComment = await updatedComment.populate("owner", "fullName username avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            populatedComment,
            "The comment was successfully updated"
        )
    )
})

const deleteComment = asyncHandler(async(req, res) =>{
        const { videoId, commentId} = req.params
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404, "Invalid video id")
    }

    const comment = await Comment.findOne({
        _id: commentId,
        owner: req.user._id,
        video: videoId
    })

    if(!comment){
        throw new ApiError(404, "The comment does not exist")
    }

    await Comment.deleteOne({
        _id: commentId,
        owner: req.user._id,
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null, 
            "The comment was deleted successfully"
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
}