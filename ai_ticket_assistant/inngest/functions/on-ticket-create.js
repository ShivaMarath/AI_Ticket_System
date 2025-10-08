import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendmail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "onTicketCreated", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const ticketId = event.data;

      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) throw new NonRetriableError("Ticket not found");
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" }, { new: true });
      });

      const relatedSkills = await step.run("ai-response", async () => {
        const aiResponse = await analyzeTicket(ticket);
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: ["low","medium","high"].includes(aiResponse.priority) ? aiResponse.priority : "medium",
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills || []
          });
          return aiResponse.relatedSkills || [];
        }
        return [];
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user;
        if (relatedSkills.length > 0) {
          user = await User.findOne({
            role: "moderator",
            skills: { $elemMatch: { $regex: relatedSkills.join("|"), $options: "i" } },
          });
        }
        if (!user) user = await User.findOne({ role: "admin" });

        await Ticket.findByIdAndUpdate(ticket._id, { assignedTo: user?._id || null });
        return user;
      });

      await step.run("send-email-notification", async () => {
        if (moderator) {
          await sendmail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you: ${ticket.title}`
          );
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Error running the steps:", error.message);
      return { success: false };
    }
  }
);
