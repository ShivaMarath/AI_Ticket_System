import jwt from "jsonwebtoken"
export const authenticate = (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        res.status(403).json({msg : "token not found"})
    }
    try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET)
         if(decoded){
             res.json({msg : "Authenticated"})
             req.user = decoded
             next()
         }
    } catch (error) {
        res.status(403).json({msg : "Unauthorized"})
    }
   

}