import express from "express"
import { authenticate } from "../middlewares/auth.js"
import { getTickets, getTicketById, createTicket, updateTicket, deleteTicket } from "../controllers/ticket.js";

const router = express.Router()

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);


export default router