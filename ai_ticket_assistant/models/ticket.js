import mongoose from "mongoose"
const ticketSchema = new mongoose.Schema({
title: String,
description:String,
status:{type:String, default: "TODO"},
createdBy:{type: mongoose.Schema.Types.ObjectId, ref:"user", default: null},
assignedTo: {type: mongoose.Schema.Types.ObjectId, ref: "user", default: null}, 
priority:String,
deadline:Date,
helpfullNotes: String,
relatedSkills: [String]
})

export default mongoose.model("Ticket", ticketSchema) 