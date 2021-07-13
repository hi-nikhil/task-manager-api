const express=require('express')
const router=new express.Router()
const auth=require('../middleware/auth')
const Task=require('../models/task')


router.post('/tasks',auth, async (req,res) =>{
    //set the user data along with the task
    //we store the id of the user in 'owner'
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(500).send()
    }
 })

//GET /tasks?completed=true (Get the tasks which is completed)
//GET /tasks?limit=10&skip=20 (Get the 10 tasks only and skip first 20 tasks)
//GET /tasks?sortBy=createdAt_asc/desc  (Get the tasks in ascending or descending form)
 router.get('/tasks',auth, async (req,res) =>{
     const match={}
      const sort={}
      //If query 'completed' is given then we only send task 
      //which 'completed' value is equal to query 
      //otherwise we send all tasks
     if(req.query.completed){
           match.completed=req.query.completed=== 'true'
     }

     //If sortBy is provided 
     if(req.query.sortBy){
         //parts =[createdAt , desc/asc]
         const parts=req.query.sortBy.split(':')
         //if desc the value of createdAt=-1 else 1
         sort[parts[0]] =parts[1] == 'desc' ? -1:1
     }

    try{
       await req.user.populate({
           path:'tasks',
           match,
           options:{
               //Change the value to int and then use it 
               //limit the number of tasks fetched
               limit:parseInt(req.query.limit),
               //skip the given number of tasks
               skip:parseInt(req.query.skip),
               //sort that is defined above
               //similar to (createdAt:-1/1)
               sort
           }
       }).execPopulate()
       res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

router.get('/tasks/:id',auth,async (req,res) =>{
    const _id=req.params.id
    try{
       //Fetching the task of a particular User
       //The User that is logged in 
       const task=await Task.findOne({_id,owner:req.user._id})

       if(!task){
        return res.status(404).send()
    }

    res.send(task)

    }catch(e){
        res.status(404).send()

    }
    
})

router.patch('/tasks/:id',auth,async (req,res) =>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['completed','description']
    const isValidOperation=updates.every((update) =>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Update'})
    }
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})

       
       //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new :true,runValidators:true})
       if(!task){
           return res.status(404).send()
       }

       updates.forEach((update) =>{
        task[update] =req.body[update]
    })
    await task.save()
       res.send(task)
    }catch(e){
       res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth, async (req,res) =>{
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)

    }catch(e){
        res.status(500).send()
    }
})

module.exports=router