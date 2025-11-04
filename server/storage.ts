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
  updateProject(id: string, project: InsertProject): Promise<Project | undefined>;
  updateProjectStatus(id: string, status: string): Promise<Project | undefined>;

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
    this.seedData();
  }

  private seedData() {
    const mockProjects: Omit<Project, "id" | "createdAt">[] = [
      {
        title: "Accounts Receivable Automation PoC",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Emily Rodriguez",
        teamMembers: "David Kim, Sarah Chen, Michael Patel",
        projectLead: "Jennifer Martinez",
        stakeholders: "Finance Operations, Product Team",
        wikiLink: "https://wiki.visa.com/ar-automation",
        usefulLinks: "https://confluence.visa.com/ar-poc",
        modified: "2024-11-01",
      },
      {
        title: "Medusa",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "James Thompson",
        teamMembers: "Lisa Wang, Robert Johnson, Amanda Lee",
        projectLead: "Kevin O'Brien",
        stakeholders: "Engineering, Security Team",
        wikiLink: "https://wiki.visa.com/medusa",
        usefulLinks: "https://docs.visa.com/medusa-project",
        modified: "2024-10-28",
      },
      {
        title: "VIK Tool",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Patricia Williams",
        teamMembers: "Christopher Davis, Maria Garcia, Thomas Brown",
        projectLead: "Rachel Cohen",
        stakeholders: "Developer Experience, Platform Team",
        wikiLink: "https://wiki.visa.com/vik-tool",
        usefulLinks: "https://github.visa.com/vik-tool",
        modified: "2024-10-25",
      },
      {
        title: "AI Powered Analytics - Unified Checkout",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Daniel Anderson",
        teamMembers: "Jessica Taylor, Andrew Wilson, Nicole Harris",
        projectLead: "Brandon Mitchell",
        stakeholders: "Analytics Team, Product Management",
        wikiLink: "https://wiki.visa.com/ai-analytics-uc",
        usefulLinks: "https://analytics.visa.com/unified-checkout",
        modified: "2024-11-02",
      },
      {
        title: "AI Assisted SA to UC Migration",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Michelle Clark",
        teamMembers: "Jason Moore, Stephanie Lewis, Eric Walker",
        projectLead: "Diana Santos",
        stakeholders: "Migration Team, Engineering Leadership",
        wikiLink: "https://wiki.visa.com/sa-uc-migration",
        usefulLinks: "https://migration.visa.com/ai-assisted",
        modified: "2024-10-30",
      },
      {
        title: "MCP Scanner",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "William Turner",
        teamMembers: "Olivia Martin, Ryan Jackson, Lauren White",
        projectLead: "Marcus Thompson",
        stakeholders: "Security Operations, Compliance",
        wikiLink: "https://wiki.visa.com/mcp-scanner",
        usefulLinks: "https://security.visa.com/mcp-scanner",
        modified: "2024-10-27",
      },
      {
        title: "Doc as a service",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Christina Young",
        teamMembers: "Matthew Hall, Samantha Adams, Joshua Green",
        projectLead: "Victoria Baker",
        stakeholders: "Documentation Team, Developer Relations",
        wikiLink: "https://wiki.visa.com/doc-service",
        usefulLinks: "https://docs.visa.com/daas",
        modified: "2024-11-03",
      },
      {
        title: "Realtime Transactions Dashboard",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Steven Campbell",
        teamMembers: "Rebecca Scott, Kevin Parker, Melissa Rivera",
        projectLead: "Gregory Foster",
        stakeholders: "Operations, Business Intelligence",
        wikiLink: "https://wiki.visa.com/realtime-dashboard",
        usefulLinks: "https://dashboard.visa.com/transactions",
        modified: "2024-10-29",
      },
      {
        title: "NLP Acceptance Analytics",
        projectType: "Product Innovation",
        status: "In Progress",
        solutionArchitect: "Angela Cooper",
        teamMembers: "Brian Morris, Jennifer Hughes, Timothy Price",
        projectLead: "Natalie Russell",
        stakeholders: "Data Science, Product Analytics",
        wikiLink: "https://wiki.visa.com/nlp-analytics",
        usefulLinks: "https://analytics.visa.com/nlp-acceptance",
        modified: "2024-11-01",
      },
      {
        title: "GoldenPath for Agentic Development",
        projectType: "Productivity",
        status: "In Progress",
        solutionArchitect: "Richard Hayes",
        teamMembers: "Kimberly Brooks, Nicholas Kelly, Ashley Sanders",
        projectLead: "Jonathan Reed",
        stakeholders: "Platform Engineering, DevOps",
        wikiLink: "https://wiki.visa.com/goldenpath-agentic",
        usefulLinks: "https://dev.visa.com/goldenpath",
        modified: "2024-10-26",
      },
      {
        title: "Developer Buddy/Assist",
        projectType: "Productivity",
        status: "In Progress",
        solutionArchitect: "Laura Phillips",
        teamMembers: "Justin Gray, Megan Peterson, Aaron Coleman",
        projectLead: "Christine Barnes",
        stakeholders: "Developer Experience, Training",
        wikiLink: "https://wiki.visa.com/dev-buddy",
        usefulLinks: "https://tools.visa.com/developer-assist",
        modified: "2024-11-02",
      },
      {
        title: "VAS Innovation Shared Infrastructure",
        projectType: "Productivity",
        status: "In Progress",
        solutionArchitect: "Donald Hughes",
        teamMembers: "Heather Ross, Jordan Bennett, Brittany Wood",
        projectLead: "Vincent Murphy",
        stakeholders: "Infrastructure, Cloud Operations",
        wikiLink: "https://wiki.visa.com/vas-infrastructure",
        usefulLinks: "https://infra.visa.com/vas-shared",
        modified: "2024-10-28",
      },
      {
        title: "Customizable Executive Dashboard / IAAS",
        projectType: "Productivity",
        status: "In Progress",
        solutionArchitect: "Sandra Powell",
        teamMembers: "Kyle Patterson, Monica Henderson, Dennis Long",
        projectLead: "Cynthia Fisher",
        stakeholders: "Executive Team, BI Analytics",
        wikiLink: "https://wiki.visa.com/exec-dashboard",
        usefulLinks: "https://executive.visa.com/dashboard",
        modified: "2024-11-03",
      },
      {
        title: "Hackathon Portal",
        projectType: "Productivity",
        status: "In Progress",
        solutionArchitect: "Gary Jenkins",
        teamMembers: "Danielle Perry, Carl Howard, Vanessa Ward",
        projectLead: "Phillip Cox",
        stakeholders: "Innovation Team, HR",
        wikiLink: "https://wiki.visa.com/hackathon-portal",
        usefulLinks: "https://hackathon.visa.com",
        modified: "2024-10-30",
      },
      {
        title: "ReverseJs-Python To Java Migration",
        projectType: "Security",
        status: "In Progress",
        solutionArchitect: "Terry Richardson",
        teamMembers: "Janet Cox, Eugene Watson, Ruby Brooks",
        projectLead: "Keith Spencer",
        stakeholders: "Security Team, Application Security",
        wikiLink: "https://wiki.visa.com/reversejs-migration",
        usefulLinks: "https://security.visa.com/migration-tools",
        modified: "2024-10-27",
      },
      {
        title: "Visa University Recommendation Engine",
        projectType: "Visa University",
        status: "In Progress",
        solutionArchitect: "Pamela Stewart",
        teamMembers: "Craig Simmons, Brenda Foster, Louis Griffin",
        projectLead: "Jacqueline Mason",
        stakeholders: "Learning & Development, HR",
        wikiLink: "https://wiki.visa.com/vu-recommendation",
        usefulLinks: "https://university.visa.com/recommendations",
        modified: "2024-11-01",
      },
      {
        title: "Visa University Skill Agent",
        projectType: "Visa University",
        status: "In Progress",
        solutionArchitect: "Willie Crawford",
        teamMembers: "Tiffany Pierce, Albert Ramirez, Evelyn Sullivan",
        projectLead: "Marilyn Butler",
        stakeholders: "Training Team, Career Development",
        wikiLink: "https://wiki.visa.com/vu-skill-agent",
        usefulLinks: "https://university.visa.com/skills",
        modified: "2024-10-29",
      },
    ];

    mockProjects.forEach((projectData) => {
      const id = randomUUID();
      const project: Project = {
        ...projectData,
        id,
        createdAt: new Date(),
      };
      this.projects.set(id, project);
    });
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

  async updateProject(id: string, insertProject: InsertProject): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }
    const updatedProject: Project = {
      ...insertProject,
      id,
      createdAt: project.createdAt,
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async updateProjectStatus(id: string, status: string): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }
    const updatedProject = {
      ...project,
      status,
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
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
