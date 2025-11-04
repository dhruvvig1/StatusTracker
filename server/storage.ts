import {
  type Project,
  type InsertProject,
  type StatusUpdate,
  type InsertStatusUpdate,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Status Updates
  getAllStatuses(): Promise<StatusUpdate[]>;
  getProjectStatuses(projectId: string): Promise<StatusUpdate[]>;
  createStatusUpdate(status: InsertStatusUpdate): Promise<StatusUpdate>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private statusUpdates: Map<string, StatusUpdate>;

  constructor() {
    this.projects = new Map();
    this.statusUpdates = new Map();
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async getAllStatuses(): Promise<StatusUpdate[]> {
    return Array.from(this.statusUpdates.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProjectStatuses(projectId: string): Promise<StatusUpdate[]> {
    return Array.from(this.statusUpdates.values())
      .filter((status) => status.projectId === projectId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async createStatusUpdate(
    insertStatus: InsertStatusUpdate
  ): Promise<StatusUpdate> {
    const id = randomUUID();
    const status: StatusUpdate = {
      ...insertStatus,
      id,
      createdAt: new Date(),
    };
    this.statusUpdates.set(id, status);
    return status;
  }
}

export const storage = new MemStorage();
