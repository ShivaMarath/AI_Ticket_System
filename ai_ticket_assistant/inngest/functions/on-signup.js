import { inngest } from "../client";
import User from "../../models/user"
import { NonRetriableError } from "inngest";
import { sendmail } from "../../utils/mailer";
    export const onUserSignup = inngest.createFunction(
        {id: "onUserSignup", retries : 2},
        {event: User/signup},
        async({event, step})=>{
            try {
                const {email} = event.data
                const user = await step.run("get-user-email", async()=>{
                    const userObject = await User.findOne({email})
                    if(!userObject){
                        throw new NonRetriableError("User dosen't exist")
                    }
                    return userObject
                })
                await step.run("send-welcome-email" , async()=>{
                    const subject = `welcome to the app`
                    const msg = `Hi
                    \n\n
                    Thanks for signing in, we are glad to have u onboard`

                     await sendmail(user.email, subject, msg)
                })
                return {success: true}
               
            } catch (error) {
                console.error("Something went wrong in running step" , error.message)
                return {success : false}
            }
        }
    )   