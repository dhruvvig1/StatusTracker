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
import { Calendar, User, Code2, Tag, Plus, ExternalLink } from "lucide-react";
import type { Project, InsertProject, StatusUpdate } from "@shared/schema";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<InsertProject>({
    title: "",
    jiraLink: "",
    dueDate: "",
    lead: "",
    developer: "",
    category: "",
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
        jiraLink: "",
        dueDate: "",
        lead: "",
        developer: "",
        category: "",
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
                Enter a Jira or Jira Align link to add a project
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="jiraLink">Jira Link or Jira Align Link *</Label>
                  <Input
                    id="jiraLink"
                    type="url"
                    placeholder="https://jira.example.com/browse/PROJECT-123"
                    value={formData.jiraLink}
                    onChange={(e) =>
                      setFormData({ ...formData, jiraLink: e.target.value })
                    }
                    required
                    data-testid="input-jira-link"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: https://jira.example.com/browse/PROJECT-123
                  </p>
                </div>

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
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      required
                      data-testid="input-due-date"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lead">Lead *</Label>
                    <Input
                      id="lead"
                      placeholder="Sarah Johnson"
                      value={formData.lead}
                      onChange={(e) =>
                        setFormData({ ...formData, lead: e.target.value })
                      }
                      required
                      data-testid="input-lead"
                    />
                  </div>

                  <div>
                    <Label htmlFor="developer">Developer *</Label>
                    <Input
                      id="developer"
                      placeholder="Mike Chen"
                      value={formData.developer}
                      onChange={(e) =>
                        setFormData({ ...formData, developer: e.target.value })
                      }
                      required
                      data-testid="input-developer"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger id="category" data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Frontend">Frontend</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="Data">Data</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <h3 className="text-lg font-semibold text-foreground line-clamp-2 flex-1">
                        {project.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{project.dueDate}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{project.category}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground truncate">{project.lead}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Code2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground truncate">{project.developer}</span>
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
