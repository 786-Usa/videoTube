import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    // videoUrl: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    thumbnail: {
        type: String,
        required: true,
        trim: true
    },
    videoFile:{
        type:String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "user"
    }

},
{
    timestamps: true
}

);

videoSchema.plugin(mongooseAggregatePaginate);

export const video = mongoose.model("video", videoSchema);