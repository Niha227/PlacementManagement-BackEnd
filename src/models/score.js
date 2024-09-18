import mongoose from "mongoose";

// create ScoreSchema
const scoreSchema = new mongoose.Schema({

    dsaScore: {
        type: Number,
        required: true
    },
    webDevScore: {
        type: Number,
        required: true
    },
    reactScore: {
        type: Number,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }
}, {
    timestamps: true
});

export const Score = mongoose.model('Score', scoreSchema);
