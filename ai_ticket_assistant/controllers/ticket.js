// controllers/ticket.js
import Ticket from "../models/ticket.js";
import { inngest } from "../inngest/client.js";

/**
 * Create a new ticket
 */
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, deadline, relatedSkills } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || "TODO",
      deadline,
      relatedSkills,
      createdBy: req.user?._id || null,
    });

    // Send Inngest event safely
    try {
      await inngest.send({ name: "ticket/created", data: ticket._id });
    } catch (err) {
      console.error("Inngest event failed", err.message);
      // Don't crash the route; ticket creation succeeded
    }

    return res.status(201).json(ticket);
  } catch (err) {
    console.error("Error creating ticket:", err.message);
    return res.status(500).json({ error: "Ticket creation failed", details: err.message });
  }
};

/**
 * Get all tickets
 */
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("assignedTo", "-password");
    return res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err.message);
    return res.status(500).json({ error: "Error fetching tickets", details: err.message });
  }
};

/**
 * Get single ticket by ID
 */
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id).populate("assignedTo", "-password");

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    return res.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err.message);
    return res.status(500).json({ error: "Error fetching ticket", details: err.message });
  }
};

/**
 * Update a ticket
 */
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    Object.assign(ticket, updates);
    await ticket.save();

    return res.json(ticket);
  } catch (err) {
    console.error("Error updating ticket:", err.message);
    return res.status(500).json({ error: "Ticket update failed", details: err.message });
  }
};

/**
 * Delete a ticket
 */
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    await ticket.deleteOne();

    return res.json({ msg: "Ticket deleted" });
  } catch (err) {
    console.error("Error deleting ticket:", err.message);
    return res.status(500).json({ error: "Ticket deletion failed", details: err.message });
  }
};
