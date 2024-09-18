import mongoose, { trusted } from "mongoose";
const UserSchema = mongoose.Schema(
    {
        username:{
            type : String,
            required : true 

        },
        password: {
            type : String,
            required: true
        },
        firstname : String,

        lastname: String,

        
        admin: {
           type : Boolean,
           required : true
        },

        company:{
            type : Boolean,
            required : true,
        },
        
        employee: { 
            type :  Boolean,
            required : true
        }
    },
    {
        timestamps: true
    }
)
export const User =mongoose.model('User', UserSchema)

const RefreshTokenSchema = mongoose.Schema(
    {
        refresh_token: {
            type: String,
            required: true
        }
    }
)
export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema)
