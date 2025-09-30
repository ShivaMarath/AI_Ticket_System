import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import { inngest } from "../inngest/client.js"

export const signup = async (req, res)=>{
    const {email, password, skills} = req.body
    try {
        const hashed = bcrypt.hash(password, 10)
        const user = await User.create({email, password: hashed, skills})
        //inngest
        await inngest.send({name: "user/signup",
            data:{
            email
        }})

        const token = jwt.sign({_id: user._id , role: user.role} , process.env.JWT_SECRET)

        res.json({user, token})
    } catch (error) {
        res.status(500).json({error: "Signup failed", details: error.message})
    }
}

export const signin = async (req, res)=>{
    const {email, password} = req.body
    try {
        const User = User.findOne({email})
        if(!User){
            res.status(403).json({msg:"Unauthorized"})
        }
        const isMatched = await bcrypt.compare(password, User.password)
        if(!isMatched){
            return res.status(403).json({Unauthorized})
        }
        const token = jwt.sign({_id: user._id , role: user.role} , process.env.JWT_SECRET)
        res.json({User, token})
    } catch (error) {
         res.status(500).json({error: "Signin failed", details: error.message})
    }
}

export const logout  = async (req,res)=>{
    try {
         const token = req.headers.authorization.split(" ")[1]
         if(!token){
            return res.json({msg: "Unauthorized"})
            jwt.verify(token, process.env.JWT_SECRET, (err,decoded)=>{
                if(err){
                    return res.json({msg: "Unauthorized"})
                }
            })
         }
    res.json({msg: "logged out"})
    } catch (error) {
         res.status(500).json({error: "Logout failed", details: error.message})
    }
   
}

export const updateUser = async (req,res)=>{
    const {skills = [], role, email} = req.body
    if(req.user?.role !== "admin"){
        res.status(403).json({error:"forbidded"})
        const getUser = await User.findOne({email})
        if(!getUser){
            res.json({error:"user dosent exist"})
        }
        await User.updateOne({email},{skills: skills.length ? skills: User.skills, role})
    }
}

export const getUser = async (req,res)=>{
    try {
        if(req.user.role !== "admin"){
            res.json({error: "forbidden"})
            const users = await User.find().select("-password")
            return res.json(users)
        }
    } catch (error) {
         res.status(403).json({error: "forbidden", details: error.message})
    
    }
} 