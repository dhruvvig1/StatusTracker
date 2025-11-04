import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { refineStatusText } from "./gemini";
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

  const httpServer = createServer(app);

  return httpServer;
}
