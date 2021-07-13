const express=require('express')
const router=new express.Router()
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendCancelEmail} =require('../emails/account')


const auth=require('../middleware/auth')
const User=require('../models/user')


router.post('/users',async (req,res) =>{
   
    const user =new User(req.body)
    try{
     await user.save()
     //this function send email when a new user join
     //function is declared in emails/account.js
     sendWelcomeEmail(user.email,user.name)

     //generateAuthToke mehod is implemented in 'user.js' in 'models'
     //It return the 'token' after login
     const token=await user.generateAuthToken()
     res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
  
 })

 router.post('/users/login',async (req,res) =>{
    try{
        //findByCredentals mehod is implemented in 'user.js' in 'models'
        //if error is not thrown it return the user
      const user=await User.findByCredentials(req.body.email, req.body.password)
        //generateAuthToke mehod is implemented in 'user.js' in 'models'
        //It return the 'token' after login
      const token=await user.generateAuthToken()
      //Everytime we send the user a method is called
      //'toJSON'  in '/models/user.js' its manipulate the user data which is need to be send
      res.send({user: user,token})
    }catch (e) {
       res.status(400).send()
    }
 })
 

 //Here we logout from one place
 router.post('/users/logout',auth,async (req,res) =>{
      try {
          //If the user is login then we have his/her token
          //for logout we will remove that particular token from token array present 
          //in database
          //This is done by filter method 
          //It just keep the token from tokens array which is not equal to given token
          //if it is equal then it filter it out
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token 
        })

        //then save the user new token array
        await req.user.save()

        res.send()
     }catch(e) {
         res.status(500).send()

     }

 })

//logout from all the places
 router.post('/users/logoutAll',auth,async (req,res) =>{
    try {
        //we make the user token array empty
        //i.e. delete al token /logout from all places
      req.user.tokens = []

      await req.user.save()

      res.send()
   }catch(e) {
       res.status(500).send()
   }
})
 
 router.get('/users/me',auth,async (req,res) =>{
     res.send(req.user)
 })
 
 router.patch('/users/me',auth, async (req,res) =>{
     const updates=Object.keys(req.body)
     const allowedUpdates=['name','email','password','age']
     const isValidOperation=updates.every((update) =>{
         return allowedUpdates.includes(update)
     })
 
     if(!isValidOperation){
         return res.status(400).send({error:'Invalid Update'})
     }
     try{
         const user=req.user
           
         updates.forEach((update) =>{
             //we don'nt know that we are updating like Email or name,so we use []
             user[update] =req.body[update]
         })
         await user.save()

        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new :true,runValidators:true})
        res.send(user)
     }catch(e){
        res.status(400).send(e)
     }
 })
 
 router.delete('/users/me',auth, async (req,res) =>{
     try{
          //remove the user 
         await req.user.remove()
         //to send email when a user is logout
         //function defined in 'emails/account'
         sendCancelEmail(req.user.email,req.user.name)
         res.send(req.user)
 
     }catch(e){
         res.status(500).send()
     }
 })

 //set the restrictions for file to be uploaded
const upload=multer({
    limits:{
        //limit of file upload in bytes
        //1000000 bytes=1 MB
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        //req-request made
        //file=file to be uploaded
        //cb=callback function calls after validation of file

        //(/\.(jpg|jpeg|png)$/) it is a 'regular expression'
        //that means it match file name that end with (jpg|jpeg|png)

        //if file extension is not valid return error
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return cb(new Error('Please upload a image '))
        }
        
        //If file validation is right there is no error so 'undefined' 
        //and 'true' because now we wnats to go further i.e. upload
        //the file
        cb(undefined,true)
       

    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'), async (req,res) =>{
    //For uploading a avatar first wwe do some modification on uploaded photo
    //for that we use a library i.e. 'sharp'

    //With the help of sharp we resize the photo into 250*250 and convert it into .png
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()

    //save the modified avatar to user.avatar
    req.user.avatar= buffer
    //save the avatar
    await req.user.save() 
    res.send()

},(error,req,res,next) =>{
    res.status(400).send({error:error.message})
    
})


router.delete('/users/me/avatar',auth,upload.single('avatar'), async (req,res) =>{
    req.user.avatar= undefined
    await req.user.save()
    res.send()

})

router.get('/users/:id/avatar',async (req,res) =>{
    try{
      const user=await User.findById(req.params.id)
      //If no user available or no 'avatar' availble
      //send error
      if(!user || !user.avatar){
          throw new Error()
      }
        
      //If avatar is availble 
      //send the response whose 'Conntent-type' is image/png
      res.set('Content-Type','image/png')
      res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})
 
 
module.exports=router