import { inngest } from "../inngest/client.js";
import ticket, {Ticket} from "../models/ticket.js"

export const createTicket = async(req,res)=>{
    try {
        const {title, description} = req.body
        if(!title || !description){
            res.status(400).json({msg:"title and description are required"})
        }
        const newTicket = Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString()
        })
        await inngest.send({
            name:"ticket/created",
            data:{
                ticketId: (await newTicket)._id.toString(),
                title,
                description,
                createdBy:req.user._id.toString()
            }
        })
        return res.status(201).json({msg:"Ticket created and processing started", ticket:newTicket})
    } catch (error) {
        console.error("error creating the ticket", error.message)
        res.status(500).json({msg:"Internal server error"})
    }
}
export const getTickets = async (req,res)=>{
    const user = req.user
    let tickets = []
    try {
        if(user.role !=="user"){
            tickets = Ticket.find({}).populate("assigned to", ["email", "_id"]).sort({createdAt:-1})
        }else{
            tickets = await Ticket.find({createdBy: user._id}).select("title description status createdAt").sort({createdAt:-1})
        }
        res.status(200).json(tickets)
    } catch (error) {
        console.error("error fetching the ticket", error.message)
        res.status(500).json({msg:"Internal server error"})
    }
}
export const getTicket = async (req,res)=>{
    const user = req.user
    let ticket
    try {
        if(user.role!=="user"){
            ticket = Ticket.findById(req.params.id).populate("assigned to", ["email", "_id"]) 
    }else{
        ticket =Ticket.findOne({createdBy:user._id, _id:req.params.id}).select("title description status createdAt")
    }
    if(!ticket){
        res.status(404).json({msg:"ticket not found"})
    }
    } catch (error) {
        
    }
    
}
