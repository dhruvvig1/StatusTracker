import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, User, Code2, Tag, Plus, ExternalLink, Users } from "lucide-react";
import type { Project, InsertProject, StatusUpdate } from "@shared/schema";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
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
      return "No status updates yet";
    }
    return projectStatuses[0].content;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Active Projects
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your project status updates
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            data-testid="button-add-project"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Project
          </Button>
        </div>

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

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
        ) : projects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                data-testid={`card-project-${project.id}`}
              >
                <Card className="hover-elevate active-elevate-2 cursor-pointer h-full transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.projectType}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-1 gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground text-xs">SA:</span>
                        <span className="text-foreground truncate">{project.solutionArchitect}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Code2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground text-xs">Lead:</span>
                        <span className="text-foreground truncate">{project.projectLead}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{project.status}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Latest Status</p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {getLatestStatus(project.id)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
