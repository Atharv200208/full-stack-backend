import mongoose, { model, Schema } from "mongoose";

const playListSchema = new mongoose.Schema({
    playListName:{
        type: String,
        required: true
    },
    description:{
        type: String,
        default: ""
    },
    playListThumbnail:{
        type: String,
    },
    videos:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},  {
    timestamps: true
    }
)

export const PlayList = mongoose.model("PlayList", playListSchema)