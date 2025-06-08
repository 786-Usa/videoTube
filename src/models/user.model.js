import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: ['Password is required', true],
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        index: true
    },
    avatar: {
        type: String ,//cloudinary
        required: true
    },
    coverImage: {
        type: String, //cloudinary
        // required: true
    },
    watchHistory: [

        {
            type: Schema.Types.ObjectId,
            ref: "video"
        }

    ],
    refreshToken: {
        type: String
    }


},
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
})
userSchema.methods.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.GenerateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            // name : this.name,
            // email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.GenerateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            //  name : this.name,
            //  email : this.email
        },
        process.env.RERESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const user = mongoose.model("user", userSchema);