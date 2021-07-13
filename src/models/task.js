const mongoose=require('mongoose')
const validator=require('validator')

const taskSchema=new mongoose.Schema({
   description:{
      type:String,
      trim:true,
      required:true,
   },
   completed:{
      type:Boolean,
      default:false
   },
   owner:{
      //This field tell which task belong to which user
      //It store id of the user
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      //It is gettig reference from  'User' model
      //This way we can connect User and Task
      ref:'User'

   }
  },{
     //Its add time to the data i.e 'Created at' and 'updated at'
      timestamps:true
   }
)

const Task=mongoose.model('Task',taskSchema)

module.exports=Task
