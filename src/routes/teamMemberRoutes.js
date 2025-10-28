import express from "express";
import multer from "multer";
import TeamMemberController from "../controllers/teamMemberController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js"; // Removed authMiddleware import

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Create team member - removed authMiddleware
router.post("/", (req, res) => TeamMemberController.createTeamMember(req, res));

// Create team member with image upload - removed authMiddleware
router.post("/create-with-image", upload.single('profile_image'), (req, res) => TeamMemberController.createTeamMemberWithImage(req, res));

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

// Update team member - removed authMiddleware
router.put("/:id", (req, res) => TeamMemberController.updateTeamMember(req, res));

// Delete team member - removed authMiddleware
router.delete("/:id", (req, res) => TeamMemberController.deleteTeamMember(req, res));

export default router;
