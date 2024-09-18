import express from 'express'
import { User, RefreshToken} from  './userModel.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config()


const UserRouter = express.Router()

UserRouter.post('/add/', async (request, response) => {

    const all_user = await User.find({})

    const {username,password} = request.body

    const user_check = all_user.find(user => user.username === username)
    const user_password = all_user.forEach(user => console.log(user.password))
   

    if(user_check === undefined) {

    const new_user =  new User(request.body)

    console.log(new_user)

    await new_user.save()

    response.json("User Created")
  
    }
    
    else { 
        response.json("User with username already exists!")
    }
    
})    

UserRouter.get('/generate/key/', (request, response) => {

    const key = crypto.randomBytes(64).toString('hex')
    response.json(key)
})

UserRouter.post('/validate/', async(request, response) => {

    console.log(request.body)
    const {username, password} = request.body


    const all_user = await User.find({})

    const user_check  = all_user.find(user => user.username === username) 

    
    if(user_check === undefined)  
        
        response.json({
            
            status : false,
            message: "invalid user"
            
        })
        
        else {
            
            if(user_check.password === password) {
                
                console.log(user_check);
            const user = {
                name: username
            }

            const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY)

            const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_KEY)

            const new_refresh_token  =  new RefreshToken({
                refresh_token : refresh_token 
            })

            await new_refresh_token.save()

            response.json({

                status: true,
                message: "Valid User",
                access_token: access_token,
                refresh_token: refresh_token,
                user_data: user_check
            })
        }
        else response.json({
            status: false,
            message: "Invalid Pasword"
        })

    }
})

UserRouter.post('/token/', async(request, response) => {

    const refresh_token = request.body.refresh_token

    if(refresh_token === null){
        return response.status(401).json("No Token found")
    }

    const all_refresh_tokens = await RefreshToken.find({refresh_token: refresh_token})

    if(all_refresh_tokens.length === 0){

        return response.status(403).json("Invalid Token")

    }

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY, (error, user) => {

        if(error) {

            return response.status(403).json("Token verification  failed")
        }

        const access_token = jwt.sign({name: user.name}, process.env.ACCESS_TOKEN_KEY,{expiresIn  : "30s"})

        console.log(access_token)

        response.json({
            access_token: access_token
        })
    })
})

UserRouter.post('/logout/', async(request, response) => {

    const refresh_token = request.body.refresh_token

    const all_refresh_tokens = await RefreshToken.find({})

    let selected_token = all_refresh_tokens.find(token => token.refresh_token === refresh_token)



    await RefreshToken.findByIdAndDelete(selected_token.id)

    response.status(200).json("Refresh token deleted")

})

export default UserRouter