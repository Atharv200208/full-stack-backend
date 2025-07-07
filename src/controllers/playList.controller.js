
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { PlayList } from "../models/playlist.model";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/ApiResponse";

const createPlayList = asyncHandler(async(req, res) => {
    //Create a new playlist
    const {playListName, description} = req.body

    if(!playListName){
        throw new ApiError(400,"Playlist name is required")
    }

    let playListThumbnailUrl = "";
    const playListThumbnailLocalPath = req.files?.playListThumbnail?.[0]?.path;

    if (playListThumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(playListThumbnailLocalPath);
        playListThumbnailUrl = uploadedThumbnail?.url || "";
    }

    if(!req.user?._id){
        throw new ApiError(400, "User not authenticated")
    }

    const playList = await PlayList.create({
        playListName,
        description,
        playListThumbnail: playListThumbnailUrl?.url || "",
        owner: req.user._id
    })

    const createdPlayList = await PlayList.findById(playList._id).populate("owner", "username fullName avatar")

    if(!createdPlayList) {
        throw new ApiError(404, "Playlist not created properly")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, createdPlayList,"Playlist created successfully")
    )

})

getUserPlayLists = asyncHandler(async(req, res) => {
    //Get the playlists of the user
    const userId = req.params

    if(!userId){
        throw new ApiError(400, "User not found")
    }

    const userPlayList = await PlayList.findById(userId)
    .populate("owner", "username fullName avatar")

    if(!userPlayList){
        throw new ApiError(404, "User playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, userPlayList, "User playlist found successfully")
    )
})

const getPlaylistById = asyncHandler(async(req, res) =>{
    const {playListId} = req.params

    if(!playListId){
        throw new ApiError(404, "The playlist ID not found")
    }

    const playList = await PlayList.findOne(
        {
        _id : playListId,
        owner: req.user._id
        }
    )

    if(!playList){
        throw new ApiError(404,"Playlist not found or Unauthorized")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playList,"Playlist was found successfully")
    )
})

const addVideoToPlayList = asyncHandler(async(req, res) => {
    //get playlist by id
    const {videoId, playListId} = req.body

    if(!playListId){
        throw new ApiError(400, "PLaylist ID does not exist")
    }

    if(!videoId){
        throw new ApiError(400, "Video ID does not exist")
    }

    const playList = await PlayList.findOne({
        _id: playListId,
        owner: req.user._id
    })

    if(!playList){
        throw new ApiError(404, "PLaylist not found")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(playList.videos.includes(videoId)){
        throw new ApiError(400, "Video already exists in th playlist")
    }

    //saves the video
    playList.videos.push(videoId)
    playList.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playList, "Video added to playlist successfully")
    )
})



export {
    createPlayList,
    addVideoToPlayList,
    getPlaylistById,
}