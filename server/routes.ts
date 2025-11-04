import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { refineStatusText, generateNewsletter } from "./gemini";
import {
  insertProjectSchema,
  insertStatusUpdateSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get all status updates (for dashboard preview)
  app.get("/api/all-statuses", async (req, res) => {
    try {
      const statuses = await storage.getAllStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching all statuses:", error);
      res.status(500).json({ error: "Failed to fetch statuses" });
    }
  });

  // Get a single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // Update full project details
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data" });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Update project status
  app.patch("/api/projects/:id/status", async (req, res) => {
    try {
      const statusSchema = z.object({
        status: z.enum(["In Progress", "On Hold", "Completed", "Archived"]),
      });
      
      const validatedData = statusSchema.parse(req.body);
      const project = await storage.updateProjectStatus(req.params.id, validatedData.status);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      res.status(500).json({ error: "Failed to update project status" });
    }
  });

  // Get all statuses for a project
  app.get("/api/projects/:id/statuses", async (req, res) => {
    try {
      const statuses = await storage.getProjectStatuses(req.params.id);
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      res.status(500).json({ error: "Failed to fetch statuses" });
    }
  });

  // Create a new status update for a project
  app.post("/api/projects/:id/statuses", async (req, res) => {
    try {
      const validatedData = insertStatusUpdateSchema.parse(req.body);
      const status = await storage.createStatusUpdate(validatedData);
      res.status(201).json(status);
    } catch (error) {
      console.error("Error creating status update:", error);
      res.status(400).json({ error: "Invalid status update data" });
    }
  });

  // Refine text using Gemini AI
  app.post("/api/refine-text", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ 
          refined: text,
          message: "Gemini API key not configured. Returning original text."
        });
      }

      const refined = await refineStatusText(text);
      res.json({ refined });
    } catch (error) {
      console.error("Error refining text:", error);
      // Return original text as fallback
      res.status(200).json({ 
        refined: req.body.text,
        message: "AI refinement failed. Returning original text."
      });
    }
  });

  // Generate newsletter
  app.get("/api/newsletter", async (req, res) => {
    try {
      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ 
          error: "Gemini API key not configured. Newsletter generation requires AI capabilities."
        });
      }

      // Get all projects and status updates
      const projects = await storage.getProjects();
      const allStatuses = await storage.getAllStatuses();

      // Filter status updates from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentStatuses = allStatuses.filter(status => {
        const statusDate = new Date(status.createdAt);
        return statusDate >= thirtyDaysAgo;
      });

      // Group statuses by project
      const statusesByProject = new Map<string, typeof recentStatuses>();
      recentStatuses.forEach(status => {
        if (!statusesByProject.has(status.projectId)) {
          statusesByProject.set(status.projectId, []);
        }
        statusesByProject.get(status.projectId)!.push(status);
      });

      // Build newsletter data structure
      let newsletterData = `# Project Status Report - Last 30 Days\n\n`;
      newsletterData += `Total Active Projects: ${projects.filter(p => p.status !== "Archived").length}\n`;
      newsletterData += `Total Status Updates: ${recentStatuses.length}\n\n`;
      newsletterData += `## Projects:\n\n`;

      projects.forEach(project => {
        const projectStatuses = statusesByProject.get(project.id) || [];
        newsletterData += `### ${project.title}\n`;
        newsletterData += `- Type: ${project.projectType}\n`;
        newsletterData += `- Current Status: ${project.status}\n`;
        newsletterData += `- Solution Architect: ${project.solutionArchitect}\n`;
        newsletterData += `- Project Lead: ${project.projectLead}\n`;
        newsletterData += `- Team: ${project.teamMembers}\n`;
        
        if (projectStatuses.length > 0) {
          newsletterData += `- Recent Updates (${projectStatuses.length}):\n`;
          projectStatuses.slice(0, 5).forEach((status, idx) => {
            const date = new Date(status.createdAt).toLocaleDateString();
            newsletterData += `  ${idx + 1}. [${date}] ${status.content}\n`;
          });
        } else {
          newsletterData += `- No recent updates in the last 30 days\n`;
        }
        newsletterData += `\n`;
      });

      // Generate newsletter using Gemini
      const newsletter = await generateNewsletter(newsletterData);
      
      res.json({ newsletter });
    } catch (error) {
      console.error("Error generating newsletter:", error);
      res.status(500).json({ 
        error: "Failed to generate newsletter. Please try again."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
