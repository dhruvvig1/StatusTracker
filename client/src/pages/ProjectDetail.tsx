import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  Code2,
  Tag,
  ArrowLeft,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  ExternalLink,
  Users,
  Link as LinkIcon,
} from "lucide-react";
import type { Project, StatusUpdate, InsertStatusUpdate } from "@shared/schema";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [statusText, setStatusText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  const { data: statuses = [], isLoading: statusesLoading } = useQuery<
    StatusUpdate[]
  >({
    queryKey: ["/api/projects", id, "statuses"],
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return await apiRequest("PATCH", `/api/projects/${id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Status updated",
        description: "Project status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addStatusMutation = useMutation({
    mutationFn: async (data: InsertStatusUpdate) => {
      return await apiRequest("POST", `/api/projects/${id}/statuses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", id, "statuses"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/all-statuses"] });
      setStatusText("");
      toast({
        title: "Status added",
        description: "Your status update has been posted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add status update. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setStatusText((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        toast({
          title: "Speech recognition error",
          description: "Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleRefineText = async () => {
    if (!statusText.trim()) {
      toast({
        title: "No text to refine",
        description: "Please enter or record some text first.",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);
    try {
      const response = await apiRequest("POST", "/api/refine-text", {
        text: statusText,
      });
      setStatusText(response.refined);
      toast({
        title: "Text refined",
        description: "Your status update has been improved by AI.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refine text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusText.trim()) {
      toast({
        title: "Empty status",
        description: "Please enter a status update.",
        variant: "destructive",
      });
      return;
    }

    addStatusMutation.mutate({
      projectId: id!,
      content: statusText,
      commenter: "Current User",
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Project not found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The project you're looking for doesn't exist.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-3" data-testid="text-project-title">
                {project.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary">{project.projectType}</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select
                    value={project.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-40 h-8" data-testid="select-project-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground block mb-1">Solution Architect</span>
                      <span className="font-medium text-foreground">{project.solutionArchitect}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Code2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground block mb-1">Project Lead</span>
                      <span className="font-medium text-foreground">{project.projectLead}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground block mb-1">Stakeholders</span>
                      <span className="font-medium text-foreground">{project.stakeholders}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground block mb-1">Team Members</span>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {project.teamMembers.split(",").map((member, i) => (
                          <div key={i} className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(member.trim())}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground block mb-2">Links</span>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={project.wikiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Wiki
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <a
                          href={project.usefulLinks}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Docs
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6" data-testid="card-new-status">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add Status Update</h3>
            <form onSubmit={handleSubmitStatus}>
              <Textarea
                placeholder="Enter your status update or use speech-to-text..."
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className={`min-h-28 mb-4 ${isRecording ? "ring-2 ring-primary animate-pulse" : ""}`}
                data-testid="textarea-status"
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleRecording}
                  data-testid="button-speech-to-text"
                  className={isRecording ? "bg-primary text-primary-foreground" : ""}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Speech to Text
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefineText}
                  disabled={isRefining || !statusText.trim()}
                  data-testid="button-ai-refine"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Refine
                    </>
                  )}
                </Button>

                <div className="flex-1" />

                <Button
                  type="submit"
                  disabled={addStatusMutation.isPending || !statusText.trim()}
                  data-testid="button-submit-status"
                >
                  {addStatusMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Update"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>

          {statusesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statuses.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No status updates yet. Be the first to add one!
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {statuses.map((status) => (
                <Card key={status.id} data-testid={`card-status-${status.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {status.commenter.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-medium text-foreground">
                            {status.commenter}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(status.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {status.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
