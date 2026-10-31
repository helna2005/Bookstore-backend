//import all package
const express=require('express')
const cors=require('cors')

//load .env file content into process.env by default
require('dotenv').config()
const routes=require("./routes/allRoutes")
require('./config/db')

//create server
const server=express()
//enable cors in server
server.use(cors())

//parse json to js content
server.use(express.json())

//use routes
server.use(routes)

//handling static file/folder
server.use('/uploads',express.static('./uploads'))

//port
const PORT=process.env.PORT

//start server
server.listen(PORT,()=>{
    console.log("server started....."); 
})

//handle global error in server using application specific middleware
server.use((err,req,res,next)=>{
    res.status(500).json(err.message)
})

//resolve api in browser using get request
server.get('/',(req,res)=>{
    res.status(200).send('<h1>server started and waiting for requset!!</h1>')
})

server.post("/",(req,res)=>{
    res.status(200).send("post request")
})