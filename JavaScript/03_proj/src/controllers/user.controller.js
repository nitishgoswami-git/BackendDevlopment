import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt, { TokenExpiredError } from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    // console.log(userId)
    try{
        const user = await User.findById(userId)
        // console.log(user)
        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()

        user.refreshToken = RefreshToken
        await user.save({validateBeforeSave : false}) 

        return {AccessToken,RefreshToken}

    }catch(err){
        console.log(err)

        throw new ApiError(500,"Some went wrong while generating Refresh and Access Token")
    }

} 

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validation -- not empty
    //check if user already exists
    //check for images, check for avatar
    //upload them to cloudinary
    //create user obj -- create entry in db
    //remove password and refresh token field from response
    //check for user creation
    // return res

    const {fullname, email, username, password} = req.body

    if (
        [fullname,email,username,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400, " All Fields are required")
    }

    const userExists = await User.findOne({
        $or: [{username},{email}]
    })
    if (userExists){ 
        throw new ApiError(409, "Username or Email already Exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path // get the path of multer 
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log(req.files?.avatar[0]?.path )

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar Required for localpath")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar Required not uploaded")
    }

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    //req body -> data
    //username or email 
    //find the user
    //check password
    //access and refresh token generate
    //send cookies
    
    const {username,email, password} = req.body

    if(!(username || email)) {
        throw new ApiError(400 , "Username or Email required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not Exists")
    }

    const isValid = user.isPasswordCorrect(password)
    if(!isValid){
        throw new ApiError(401, "Password Incorrect")
    }

    const {AccessToken,RefreshToken} = await generateAccessAndRefreshToken(user._id)

    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("AccessToken",AccessToken,options)
    .cookie("RefreshToken",RefreshToken,options)
    .json(
            new ApiResponse(200,
                {
                    user: LoggedInUser,AccessToken,RefreshToken
                },
                "User logged In Successfully"
            )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken:undefined
            }
        },
        {
            new : true
        }
        
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("AccessToken",options)
    .clearCookie("RefreshToken",options)
    .json(
            new ApiResponse(200,
                {},
                "User logged Out Successfully"
            )
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }

   try {
     const decodedToken  = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id)
 
     if (!user){
         throw new ApiError(401, "Invalid Refresh Token")
 
     }
 
     if (incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Refresh is Expired or Used")
     }
     
     const options = {
         httpOnly:true,
         secure: true
     }
 
     const {newAccessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)
     return res
     .status(200)
     .cookie("AccessToken",newAccessToken,options)
     .cookie("RefreshToken",newRefreshToken,options)
     .json(
         new ApiResponse(
             200,
             {
                 newAccessToken, RefreshToken: newRefreshToken
             },
             "Access Token Refreshed"
         )
     )
   } catch (error) {
    
    console.log(error)
    throw new ApiError(401, "Invalid RefreshToken")
   }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}