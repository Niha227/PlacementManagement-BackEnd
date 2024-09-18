import jwt from 'jsonwebtoken'
import  {config} from 'dotenv'

config()

export const authentication = (request, response, next) => {

    console.log(request.headers['authorization']);

    const authHeader = request.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]
    
    if(token === null) return response.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, user) => {


        if (error) {
            console.log(error)
            return response.sendStatus(403)

        }
        request.user = user
        next()
    })    
}