import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation not empty
    // check if user already exists: username, email 
    // check for images, check for avatar
    // upload them to cloudinary, avatar 
    // create user object create entry in db 
    // remove password and refresh token field from response 
    // check for user creation
    // return res

    const { name, password, email } = req.body
    console.log(name, password, email);
    if (
        [name, password, email].some((field) =>
            field?.trim() === "")

    ) {
        throw new ApiError(400, "All fields are required!")
    }
    const existedUser = await user.findOne({
        $or: [{ email }, { name }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists!")

    }

  console.log("Checking avatar file...");
console.log("avatar:", req.files?.avatar);
console.log("avatar path:", req.files?.avatar?.[0]?.path);


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
console.log(req.files);
    const newuser = await user.create({
        name,
        email,
        password,
        // username: username.toLowerCase(),
          avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await user.findById(newuser._id).select("-password -refreshToken")
    //check if user is already created



    if (!createdUser) {
        throw new ApiError(500, "User not created")
    }

    return res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser)
    );

});

export { registerUser };