import mongoose from 'mongoose'

// Create ResultSchema
const ResultSchema = new mongoose.Schema({

    result: {
        type: String,
        enum: ["Selected", "Not Selected", "On Hold", "Absent", "Interview Pending"],
        trim: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }
}, 
{
    timestamps: true
});

export const Result = mongoose.model('Result', ResultSchema);