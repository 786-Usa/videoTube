import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";




const generateAccessAndRefreshToken = async (userId) => { //used in loginUser();
    try {
        const dbUser = await user.findById(userId);


        if (!dbUser) {
            console.log("user not found db user!!");
            throw new ApiError(404, "User not found");
        }
        console.log("User found:", dbUser.email);

        console.log("Calling GenerateAccessToken...");

        const accessToken = dbUser.GenerateAccessToken();

        console.log("Calling GenerateRefreshToken...");
        const refreshToken = dbUser.GenerateRefreshToken();

        console.log("Saving user with new tokens...");
        dbUser.accessToken = accessToken;
        dbUser.refreshToken = refreshToken;
        await dbUser.save({ validateBeforeSave: false });
        console.log("Tokens generated successfully");

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token generation error:", error);
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}




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


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordMatched = await existingUser.isPasswordMatched(password);
    if (!isPasswordMatched) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id);

    const loggedInUser = await user.findById(existingUser._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
});


const logoutUser = asyncHandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully", {}));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken //refreshToken used , then again should not be used

    if (!incomingToken) {
        throw new ApiError(401, "Refresh token is required");
    }
    try {
        const decodedToken = JsonWebTokenError.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await user.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
        if (incomingToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }


        const options = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id);


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(new ApiResponse(200, "User logged in successfully", {
                accessToken,
                newrefreshToken
            }));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");

    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

};