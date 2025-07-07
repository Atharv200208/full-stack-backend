import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { PlayList } from "../models/playlist.model";


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

export {createPlayList}