import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import userRoutes from "./routes/user.js"
const PORT = process.env.PORT || 3000

const app = express()
app.use(cors)
app.use(express.json())
app.use("api/auth" , userRoutes)

mongoose.connect(process.env.MONGO_URL)
.then(()=>{console.log("MongoDB is connected");
    app.listen(PORT, ()=>{console.log("server at localhost:3000")})
})
.catch((e)=>{console.error(e)})