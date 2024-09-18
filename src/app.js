import express from 'express'
import { json,urlencoded } from 'express'
import { config } from 'dotenv';
import {set,connect} from 'mongoose'
import StudentRouter from './Routers/studentRouter.js'
import InterviewRouter from './Routers/interviewRouter.js';
//import ResultRouter from './Routers/resultRouter.js';
import UserRouter from './authentication/userRouter.js'
//import ScoreRouter from './score/scoreRouter.js';
import jwt from 'jsonwebtoken'
import cors from 'cors'
const app = express()
app.use(json());
app.use(urlencoded({extended:true}))
app.use(cors())
app.use('/student/',StudentRouter)
//app.use('/score/', ScoreRouter)
app.use('/interview/', InterviewRouter)
//app.use('/result',ResultRouter)
app.use('/user/',UserRouter)
config()
set('strictQuery', false)
const port = process.env.PORT
const mongo_db = process.env.MONGO_DB 
const start =  async() => {
    await connect(`${mongo_db}`)
    app.listen(port, console.log(`Listening to port ${port}`))

}
start()
