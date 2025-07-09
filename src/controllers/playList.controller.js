import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { PlayList } from "../models/playlist.model";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";

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
        playListThumbnail: playListThumbnailUrl || "",
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

const getUserPlayLists = asyncHandler(async(req, res) => {
    //Get the playlists of the user
    const { userId } = req.params

    if(!userId){
        throw new ApiError(400, "User not found")
    }

    const userPlayList = await PlayList.find({owner : userId})
    .populate("owner", "username fullName avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(200, userPlayList, "User playlist(s) found successfully")
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
        throw new ApiError(400, "Playlist ID does not exist")
    }

    if(!videoId){
        throw new ApiError(400, "Video ID does not exist")
    }

    const playList = await PlayList.findOne({
        _id: playListId,
        owner: req.user._id
    })

    if(!playList){
        throw new ApiError(404, "Playlist not found")
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
    await playList.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playList, "Video added to playlist successfully")
    )
})

const removeVideoFromPlayList = asyncHandler(async(req, res) => {
    const {playListId, videoId} = req.params
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
        throw new ApiError(400, "PLaylist does not exist")
    }

    const videoIndex = playList.videos.findIndex(
        (vid) => vid.toString() === videoId
    );

    if(videoIndex === -1){
        throw new ApiError(404,"Video not found in the playlist")
    }

    playList.videos.splice(videoIndex, 1)
    await playList.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playList, "The video has been removed from playlist" )
    )
})

const deletePlayList = asyncHandler(async(req, res) => {
    const {playListId} = req.params

    if(!playListId){
        throw new ApiError(400, "Playlist ID does not exist")
    }

    const playList = await PlayList.findOne({
        _id: playListId,
        owner: req.user._id
    })
    
    if(!playList){
        throw new ApiError(404, "Playlist does not exist")
    }
 
    await PlayList.deleteOne(
        { 
            _id: playListId, 
            owner: req.user._id 
        });

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Playlist deleted successfully")
        );
})

const updatePlayList = asyncHandler(async(req, res) => {
    const {playListId} = req.params
    const {name, description} = req.body

       if (!mongoose.Types.ObjectId.isValid(playListId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    if(!playListId){
        throw new ApiError(400, "Playlist ID does not exist")
    }

    const playList = await PlayList.findOne({
        _id: playListId,
        owner: req.user._id
    })
    
    if(!playList){
        throw new ApiError(404, "Playlist does not exist")
    }

    const updatedPlayList = await PlayList.findByIdAndUpdate(
        playListId,
        {
            $set:{
                playListName: name ?? playList.playListName,
                description: description ?? playList.description
            },
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlayList , "The playlist has been updated")
    )
})
export {
    createPlayList,
    getUserPlayLists,
    addVideoToPlayList,
    getPlaylistById,
    removeVideoFromPlayList,
    deletePlayList,
    updatePlayList
}