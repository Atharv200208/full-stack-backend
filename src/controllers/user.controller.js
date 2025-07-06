import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try{
     const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }

     const accessToken = user.generateAccessToken()
    //  console.log("Access Token: ", accessToken);
     const refreshToken = user.generateRefreshToken()
        // console.log("Refresh Token: ", refreshToken);
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); //we do not want to validate the user before saving the refresh token 

        return { accessToken, refreshToken }

    }
    catch(error){
        console.error("Error in Token Generation:", error);
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {

        const {fullName, email, username, password} = req.body

        if (
            [fullName, email, username, password].some((field) => field?.trim() === "")
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

const loginUser = asyncHandler(async (req, res) => {
    //request body data
    //check username email fields are not empty
    //check if user exists
    //password match
    //access and refresh token generation
    //send secure cookie 
    const { username, email ,password } = req.body;
    if(!username && !email ){
        throw new ApiError(400, "Username or email is required")
    }

     const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credential")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,//usually the cookies can be modified through frontend but this will not allow the frontend to modify the cookies and can only be modified through server
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User has been logged in successfully"
            )
        )


});

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new:true    //to return the updated user
        },
    )
    const options = {
        httpOnly: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, "User has been logged out successfully")

})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unautorized request");
    }

   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET,
     )
 
     const user = await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401, "Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Invalid refresh token")
     }
 
     const options = {
         httpOnly: true, secure:true
     }
 
     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken",refreshToken, options)
     .json(
         new ApiResponse(
             200, 
             {accessToken, refreshToken: newRefreshToken},
             "Access Token Refreshed successfully"
         )
     )
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
   }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const{oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))

    // const getCurrentUser = asyncHandler(async(req, res) => {
    //     return res
    //     .status(200)
    //     .json(
    //         new ApiResponse(200, req.user, "Current user fetched successfully")
    //     )
    // })

    // const updateAccountDetails = asyncHandler(async(req, res) => {
    //     const {fullName, email} = req.body

    //     if(!fullName || !email){
    //         throw new ApiError(400, "Atleast one field is required")
    //     }

    //     const user = User.findByIdAndUpdate(
    //         req.user?._id,
    //         {
    //             $set: {
    //                 fullName,
    //                 email: email
    //             }
    //         },
    //         {new: true}
    //     ).select("-password")

    //     return res
    //     .status(200)
    //     .ApiResponse(200, user , "User details updated successfully")

    // })
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "Atleast one field is required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .ApiResponse(200, user , "User details updated successfully")

})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.urk) {
        throw new ApiError(400, "Error while uploading avatar image")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new : true},
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User avatar has been updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const covrImageLocalPath = req.file?.path

    if (!covrImageLocalPath) {
        throw new ApiError(400, "Cover image is required")
    }

    const coverImage = await uploadOnCloudinary(covrImageLocalPath)

    if (!coverImage.urk) {
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new : true},
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User cover image has been updated successfully")
    )
})
export {registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage}