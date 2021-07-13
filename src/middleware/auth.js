const jwt=require('jsonwebtoken')
const User=require('../models/user')

const auth=async (req,res,next) =>{

    try{
        //All the clients need to provide token
        //token is send along with the req
        //it is send as headers(see Portman)
        //the key is='Authorization' and value is='Bearer token'

        //So we are taking the token from header whose key is='Authorization'
        //and we are removing 'Bearer' from value to get the original token
        //by the help of 'replace' method
       const token=req.header('Authorization').replace('Bearer ','')

       //verify the token
       const decoded=jwt.verify(token,process.env.JWT_SECRET)
       //Check the given token is present in database 
       //i.e. in 'Token' Schema
       const user=await User.findOne({ _id:decoded._id , 'tokens.token':token})
       
       //If there is no token ,no use present
       if(!user){
           throw new Error()
       }
      
       //send the user along with his/her token
       req.token=token
       req.user=user
       next()


    }catch(e){
        res.status(401).send({error:'Please authenticate.'})
    }
    
}

module.exports=auth