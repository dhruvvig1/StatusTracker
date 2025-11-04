import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, User, Plus, MoreVertical, MessageSquare, FileText, Mail, Loader2, Newspaper } from "lucide-react";
import type { Project, InsertProject, StatusUpdate } from "@shared/schema";

const getPriorityFromProjectType = (type: string) => {
  switch (type) {
    case "Security":
      return { label: "HIGH", bgColor: "bg-red-100", textColor: "text-red-700" };
    case "Product Innovation":
      return { label: "MEDIUM", bgColor: "bg-[rgb(255,244,220)]", textColor: "text-yellow-700" };
    case "Productivity":
      return { label: "LOW", bgColor: "bg-green-100", textColor: "text-green-700" };
    case "Visa University":
      return { label: "MEDIUM", bgColor: "bg-[rgb(255,244,220)]", textColor: "text-yellow-700" };
    default:
      return { label: "MEDIUM", bgColor: "bg-[rgb(255,244,220)]", textColor: "text-yellow-700" };
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const TeamAvatars = ({ teamMembers }: { teamMembers: string }) => {
  const members = teamMembers.split(",").map((m) => m.trim()).slice(0, 3);
  return (
    <div className="flex -space-x-2">
      {members.map((member, i) => (
        <Avatar key={i} className="h-7 w-7 border-2 border-background">
          <AvatarFallback className="text-xs">{getInitials(member)}</AvatarFallback>
        </Avatar>
      ))}
      {teamMembers.split(",").length > 3 && (
        <Avatar className="h-7 w-7 border-2 border-background">
          <AvatarFallback className="text-xs">
            +{teamMembers.split(",").length - 3}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [newsletter, setNewsletter] = useState("");
  const [isGeneratingNewsletter, setIsGeneratingNewsletter] = useState(false);
  const [formData, setFormData] = useState<InsertProject>({
    title: "",
    projectType: "",
    status: "In Progress",
    solutionArchitect: "",
    teamMembers: "",
    projectLead: "",
    stakeholders: "",
    wikiLink: "",
    usefulLinks: "",
    modified: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: allStatuses = [] } = useQuery<StatusUpdate[]>({
    queryKey: ["/api/all-statuses"],
  });

  const activeProjects = projects.filter(p => p.status !== "Archived");
  const archivedProjects = projects.filter(p => p.status === "Archived");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest("POST", "/api/projects", formData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      toast({
        title: "Project added",
        description: "Your project has been successfully added to the active list.",
      });
      
      setFormData({
        title: "",
        projectType: "",
        status: "In Progress",
        solutionArchitect: "",
        teamMembers: "",
        projectLead: "",
        stakeholders: "",
        wikiLink: "",
        usefulLinks: "",
        modified: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLatestStatus = (projectId: string) => {
    const projectStatuses = allStatuses.filter(s => s.projectId === projectId);
    if (projectStatuses.length === 0) {
      return null;
    }
    return projectStatuses[0];
  };

  const getStatusCount = (projectId: string) => {
    return allStatuses.filter(s => s.projectId === projectId).length;
  };

  const handleGenerateNewsletter = async () => {
    setIsGeneratingNewsletter(true);
    try {
      const response = await apiRequest("GET", "/api/newsletter");
      setNewsletter(response.newsletter);
      setShowNewsletterDialog(true);
      toast({
        title: "Newsletter generated",
        description: "Your monthly project status newsletter is ready.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNewsletter(false);
    }
  };

  const handleSendEmail = () => {
    const today = new Date();
    const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const subject = `Project Status Newsletter - ${monthYear}`;
    const body = newsletter;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const priority = getPriorityFromProjectType(project.projectType);
    const latestStatus = getLatestStatus(project.id);
    const statusCount = getStatusCount(project.id);

    return (
      <Link
        href={`/projects/${project.id}`}
        data-testid={`card-project-${project.id}`}
      >
        <Card className="hover-elevate active-elevate-2 cursor-pointer h-full transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <span className={`${priority.bgColor} ${priority.textColor} text-xs font-semibold px-2.5 py-0.5 rounded-md`}>
                {priority.label}
              </span>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <h3 className="text-base font-semibold text-foreground line-clamp-2 mb-2">
              {project.title}
            </h3>

            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {latestStatus ? latestStatus.content : "No updates yet. Click to add the first status update."}
            </p>

            <div className="flex items-center justify-between">
              <TeamAvatars teamMembers={project.teamMembers} />
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{statusCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{project.modified}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Projects
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your project status updates
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateNewsletter}
              disabled={isGeneratingNewsletter}
              variant="outline"
              data-testid="button-generate-newsletter"
            >
              {isGeneratingNewsletter ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Newspaper className="h-5 w-5 mr-2" />
                  Generate Newsletter
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              data-testid="button-add-project"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        <Dialog open={showNewsletterDialog} onOpenChange={setShowNewsletterDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Monthly Project Status Newsletter</DialogTitle>
              <DialogDescription>
                AI-generated summary of all projects and status updates from the last 30 days
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted rounded-md p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {newsletter}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowNewsletterDialog(false)}
                  data-testid="button-close-newsletter"
                >
                  Close
                </Button>
                <Button
                  onClick={handleSendEmail}
                  data-testid="button-send-email"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {showForm && (
          <Card className="mb-6" data-testid="card-project-form">
            <CardHeader>
              <h3 className="text-lg font-semibold">Add New Project</h3>
              <p className="text-sm text-muted-foreground">
                Enter project details to add it to the tracker
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="Q4 Platform Migration"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      data-testid="input-title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, projectType: value })
                      }
                      required
                    >
                      <SelectTrigger id="projectType" data-testid="select-project-type">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Product Innovation">Product Innovation</SelectItem>
                        <SelectItem value="Productivity">Productivity</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Visa University">Visa University</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="solutionArchitect">Solution Architect *</Label>
                    <Input
                      id="solutionArchitect"
                      placeholder="Sarah Johnson"
                      value={formData.solutionArchitect}
                      onChange={(e) =>
                        setFormData({ ...formData, solutionArchitect: e.target.value })
                      }
                      required
                      data-testid="input-solution-architect"
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectLead">Project Lead *</Label>
                    <Input
                      id="projectLead"
                      placeholder="Mike Chen"
                      value={formData.projectLead}
                      onChange={(e) =>
                        setFormData({ ...formData, projectLead: e.target.value })
                      }
                      required
                      data-testid="input-project-lead"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="teamMembers">Team Members *</Label>
                    <Input
                      id="teamMembers"
                      placeholder="John Doe, Jane Smith, Bob Wilson"
                      value={formData.teamMembers}
                      onChange={(e) =>
                        setFormData({ ...formData, teamMembers: e.target.value })
                      }
                      required
                      data-testid="input-team-members"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="stakeholders">Stakeholders *</Label>
                    <Input
                      id="stakeholders"
                      placeholder="Product Team, Engineering Leadership"
                      value={formData.stakeholders}
                      onChange={(e) =>
                        setFormData({ ...formData, stakeholders: e.target.value })
                      }
                      required
                      data-testid="input-stakeholders"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wikiLink">Wiki Link *</Label>
                    <Input
                      id="wikiLink"
                      type="url"
                      placeholder="https://wiki.visa.com/project"
                      value={formData.wikiLink}
                      onChange={(e) =>
                        setFormData({ ...formData, wikiLink: e.target.value })
                      }
                      required
                      data-testid="input-wiki-link"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="usefulLinks">Useful Links *</Label>
                    <Input
                      id="usefulLinks"
                      type="url"
                      placeholder="https://docs.visa.com/project"
                      value={formData.usefulLinks}
                      onChange={(e) =>
                        setFormData({ ...formData, usefulLinks: e.target.value })
                      }
                      required
                      data-testid="input-useful-links"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="button-submit">
                    Add Project
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active" data-testid="tab-active">
              Active Projects ({activeProjects.length})
            </TabsTrigger>
            <TabsTrigger value="archived" data-testid="tab-archived">
              Archived Projects ({archivedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-muted rounded mb-3" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeProjects.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No active projects</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by adding your first project
                  </p>
                  <Button onClick={() => setShowForm(true)} data-testid="button-add-first-project">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Project
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-0">
            {archivedProjects.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No archived projects</h3>
                  <p className="text-sm text-muted-foreground">
                    Projects marked as archived will appear here
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {archivedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
