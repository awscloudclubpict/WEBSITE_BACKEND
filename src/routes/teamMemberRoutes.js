import express from "express";
import TeamMemberController from "../controllers/teamMemberController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create team member (admin only)
router.post("/", authMiddleware, (req, res) => TeamMemberController.createTeamMember(req, res));

// Get team members (public)
router.get("/", (req, res) => TeamMemberController.getTeamMembers(req, res));

// Specific team routes (public)
router.get("/core", (req, res) => TeamMemberController.getCoreTeam(req, res));
router.get("/tech-team", (req, res) => TeamMemberController.getTechTeam(req, res));
router.get("/web-dev", (req, res) => TeamMemberController.getWebDevTeam(req, res));
router.get("/event-management", (req, res) => TeamMemberController.getEventManagementTeam(req, res));
router.get("/design", (req, res) => TeamMemberController.getDesignTeam(req, res));
router.get("/social-media", (req, res) => TeamMemberController.getSocialMediaTeam(req, res));
router.get("/documentation", (req, res) => TeamMemberController.getDocumentationTeam(req, res));
router.get("/tech-blog", (req, res) => TeamMemberController.getTechBlogTeam(req, res));

// Update team member (admin only)
router.put("/:id", authMiddleware, (req, res) => TeamMemberController.updateTeamMember(req, res));

// Delete team member (admin only)
router.delete("/:id", authMiddleware, (req, res) => TeamMemberController.deleteTeamMember(req, res));

export default router;
