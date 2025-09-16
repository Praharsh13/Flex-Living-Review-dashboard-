import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connecttoDB from './src/db.js'

//Routes import 
import reviewRouter from './src/routes/review.routes.js'
import authRouter from './src/routes/auth.routes.js'
//Configure the .env file path
dotenv.config({
    path:"./.env"
})


connecttoDB()
const app = express()
app.use(express.json())  
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin:process.env.DASHBOARD_API,
    credentials:true
}))

const PORT=process.env.PORT || 8081

//To check health at time of deployment
app.get('/api/health', (req, res) => 
res.status(200).json({ success: true }))
app.use('/api/reviews',reviewRouter)
app.use('/api/auth',authRouter)


app.listen(PORT,()=>
 console.log(`Running on post ${PORT}`)
)