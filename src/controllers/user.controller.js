import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {

        const {fullName, email, username, password} = req.body
        //console.log("email", email)

        if (
            [fullName, email, username, password] .some((reqField) => {
                reqField?.trim === ""
            })
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        
        if (existingUser) {
            throw new ApiError(409, "User already exists")
        }
        console.log(req.files);
        
        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar image is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar image is required")
        }

      const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, password, 
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(   //here in the select the fields are the ones that we do not want because by default all the fields are selected
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while creating the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User has been registered successfully")
        )
})

export {registerUser}