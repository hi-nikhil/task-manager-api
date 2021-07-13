const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')
const userSchema=new mongoose.Schema({
    name:{
       type:String,
       required:true,
       trim:true
    },
    email:{
       type:String,
       //everyone has differnt Email
       unique:true,
       required:true,
       trim:true,
       lowercase:true,
       validate(value){
           if(!validator.isEmail(value)){
               throw new Error('Email is invalid!')
           }
       }
    },
    age:{
       type:Number,
       default:0,
       validate(value){
           if(value<0){
               throw new Error('Age must be positive number')
           }
       }

    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        }

        
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        //we store the profile pic in form of Binary data i.e. Buffer
        type:Buffer
    }
},{
    //Its add time to the data i.e 'Created at' and 'updated at'
    timestamps:true
})

//It is used to connect User to the Task
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//This method is called wach time when a user is send as a response
//If we are sending data of a use rwe do'nt  need to send password,tokens array 
//to the user to we delete from user object
userSchema.methods.toJSON =function(){
    const user=this
    const userObject=user.toObject()

    //Deleting password and another private info
    delete userObject.password
    delete userObject.tokens 
    delete userObject.avatar

    return userObject

}

userSchema.methods.generateAuthToken=async function() {
    const user=this
    //provides token for user _id
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)

    //creating array of object for token(see schema of token)
    user.tokens=user.tokens.concat({ token})
    //saving the token
    await user.save()


    return token


}

//For login ,to check user is present or not
userSchema.statics.findByCredentials = async (email,password) =>{
    //to check user Email
    const user=await User.findOne({ email })

    //if Email is not present throw error
    if(!user){
        throw new Error('Unable to login')
    }

    //If Email is matched check the password 
    const isMatch=await bcrypt.compare(password,user.password)

    //If password is not matched throw error
    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}




//Hash the plain text password before saving
userSchema.pre('save',async function(next) {
    const user =this
    if(user.isModified('password')){
       user.password=await bcrypt.hash(user.password,8)
    }



    next()

})

// Delete user task when user is removed/logged out
userSchema.pre('remove',async function (next) {
    const user=this
    await Task.deleteMany({owner:user._id})
   next()
})

const User=mongoose.model('User',userSchema)

module.exports = User