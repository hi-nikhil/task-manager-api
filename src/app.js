const express=require('express')
 require('./db/mongoose')
 const User=require('./models/user')
 const Task=require('./models/task')

 const userRouter=require('./routers/user')
 const taskRouter=require('./routers/task')

const app=express()

//parse incoming json into object so we get get it into our routes
app.use(express.json())

app.use(userRouter)

app.use(taskRouter)

module.exports=app





