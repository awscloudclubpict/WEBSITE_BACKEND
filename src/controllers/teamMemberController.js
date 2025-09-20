import { createTeamMemberSchema, updateTeamMemberSchema } from "../validation/teamMemberSchemas.js";
import TeamMember from "../models/TeamMember.js";

class TeamMemberController {
    async createTeamMember(req, res) {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const result = createTeamMemberSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const teamMemberData = result.data;
        teamMemberData.createdBy = req.user.email;

        try {
            const teamMember = new TeamMember(teamMemberData);
            await teamMember.save();
            res.status(201).json({ message: "Team member created successfully", teamMember });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getTeamMembers(req, res) {
        const { team } = req.query;
        try {
            let query = {};
            if (team && team.toLowerCase() !== "all") {
                query.team = new RegExp(`^${team}$`, "i"); // case-insensitive exact match
            }
            const teamMembers = await TeamMember.find(query);
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Specific team routes
    async getCoreTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Core$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getTechTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Tech Team$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getWebDevTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Web Dev$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getEventManagementTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Event Management$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getDesignTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Design$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getSocialMediaTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Social Media$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getDocumentationTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Documentation$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getTechBlogTeam(req, res) {
        try {
            const teamMembers = await TeamMember.find({ team: /^Tech\+Blog$/i });
            res.json({ teamMembers });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async updateTeamMember(req, res) {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const { id } = req.params;
        const result = updateTeamMemberSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        try {
            const updatedTeamMember = await TeamMember.findByIdAndUpdate(id, result.data, { new: true });
            if (!updatedTeamMember) {
                return res.status(404).json({ error: "Team member not found" });
            }
            res.json({ message: "Team member updated successfully", teamMember: updatedTeamMember });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async deleteTeamMember(req, res) {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const { id } = req.params;
        try {
            const deleted = await TeamMember.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({ error: "Team member not found" });
            }
            res.json({ message: "Team member deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default new TeamMemberController();
