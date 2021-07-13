const sgMail=require('@sendgrid/mail')

//api key given by 'SendGrid'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//function is to send email when a new user is login
const sendWelcomeEmail=(email,name) =>{
    sgMail.send({
        to:email,
        from:'nikhil.18430@knit.ac.in',
        subject:'Thanks for joining in!',
        text:`Welocme to the app, ${name}.Let me know how you get along with the app.`

    })
}


//function to send email when a user is logout
const sendCancelEmail=(email,name) =>{
    sgMail.send({
        to:email,
        from:'nikhil.18430@knit.ac.in',
        subject:'Sorry to see you go!',
        text:`Goodbye, ${name} ,I hope to see you back sometime soon!`
        
    })
}
module.exports={
    sendWelcomeEmail,
    sendCancelEmail
}