
import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'

const registerUser = asyncHandler( async(req, res) => {
    // Get the user data from the request body
    // validate the user data
    // check if the user already exists
    // check for images, check for avatar
    // upload the image to cloudinary
    // create a new user object- create entry in the database
    // remove the password and refresh token fields from response
    // check for user creation
    // return res

    const { fullname, email, username, password } = req.body

    
    if([fullname, email, username, password].some(field => field?.trim() === "")) {
        return next(new ApiError( 401,"Please fill all the fields",))
    }
   const existedUser = await User.findOne({ 
        $or:[
            { email },
            { username }
        ]
   })
    if (existedUser) { 
        throw new ApiError( "User already exists",400)
    }
    // console.log(req.files)
    const avatarlocalPath = req.files?.avatar[0]?.path;
    // const coverlocalPath = req.files?.coverImage[0]?.path;
    
    let coverlocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverlocalPath = req.files.coverImage[0].path
    }

    if (!avatarlocalPath ) {
        return next(new ApiError(400, "Please upload the avatar image"))
    }
    const avatar = await uploadOnCloudinary(avatarlocalPath)
    const coverImage = await uploadOnCloudinary(coverlocalPath)
    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }
    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "User not created")
    }

    return res.status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    )
})

export { registerUser}