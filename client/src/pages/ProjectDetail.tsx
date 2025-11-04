import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Calendar,
  User,
  Code2,
  Tag,
  ArrowLeft,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { Project, StatusUpdate, InsertStatusUpdate } from "@shared/schema";

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

  const addStatusMutation = useMutation({
    mutationFn: async (data: InsertStatusUpdate) => {
      return await apiRequest("POST", `/api/projects/${id}/statuses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", id, "statuses"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
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
        <div className="max-w-4xl mx-auto px-6 py-8">
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-project-title">
              {project.title}
            </h2>
            <a
              href={project.jiraLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
              data-testid="link-jira"
            >
              <ExternalLink className="h-4 w-4" />
              View in Jira
            </a>
          </div>

          <div className="flex flex-wrap gap-4 pb-6 border-b">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium text-foreground">{project.dueDate}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lead:</span>
              <span className="font-medium text-foreground">{project.lead}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Developer:</span>
              <span className="font-medium text-foreground">{project.developer}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium text-foreground">{project.category}</span>
            </div>
          </div>
        </div>

        <Card className="mb-6" data-testid="card-new-status">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Add Status Update</h3>
            <form onSubmit={handleSubmitStatus}>
              <Textarea
                placeholder="Enter your status update or use speech-to-text..."
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className={`min-h-24 mb-4 ${isRecording ? "ring-2 ring-primary animate-pulse" : ""}`}
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
            <div className="space-y-4">
              {statuses.map((status, index) => (
                <Card key={status.id} data-testid={`card-status-${status.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {status.commenter.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-medium text-foreground">
                            {status.commenter}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(status.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {status.content}
                        </p>
                      </div>
                    </div>

                    {index < statuses.length - 1 && (
                      <div className="ml-5 mt-4 mb-0 border-l-2 h-4 border-border" />
                    )}
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
