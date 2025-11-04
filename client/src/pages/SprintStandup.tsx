import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Clock,
  Mail,
  CheckCircle2,
} from "lucide-react";

interface JiraTicket {
  id: string;
  key: string;
  title: string;
  assignee: string;
  status: "todo" | "inprogress" | "complete";
  description: string;
  statusUpdates: string[];
}

// Mock Jira ticket data
const mockTickets: JiraTicket[] = [
  {
    id: "1",
    key: "VASINNOV-101",
    title: "Implement OAuth 2.0 authentication",
    assignee: "John Doe",
    status: "inprogress",
    description: "Add OAuth 2.0 flow for secure user authentication",
    statusUpdates: [],
  },
  {
    id: "2",
    key: "VASINNOV-102",
    title: "Fix payment processing bug",
    assignee: "Jane Smith",
    status: "todo",
    description: "Resolve timeout issue in payment gateway integration",
    statusUpdates: [],
  },
  {
    id: "3",
    key: "VASINNOV-103",
    title: "Update API documentation",
    assignee: "Bob Johnson",
    status: "complete",
    description: "Document all REST API endpoints with examples",
    statusUpdates: ["Completed documentation for all endpoints", "Reviewed by tech lead"],
  },
  {
    id: "4",
    key: "VASINNOV-104",
    title: "Database migration script",
    assignee: "Alice Williams",
    status: "inprogress",
    description: "Create migration for user permissions table",
    statusUpdates: ["Migration script created", "Testing in dev environment"],
  },
  {
    id: "5",
    key: "VASINNOV-105",
    title: "Security audit review",
    assignee: "Charlie Brown",
    status: "todo",
    description: "Address findings from Q4 security audit",
    statusUpdates: [],
  },
  {
    id: "6",
    key: "VASINNOV-106",
    title: "Performance optimization",
    assignee: "David Lee",
    status: "complete",
    description: "Optimize database queries for dashboard page",
    statusUpdates: ["Reduced query time by 60%", "Deployed to production"],
  },
  {
    id: "7",
    key: "VASINNOV-107",
    title: "Frontend UI/UX improvements",
    assignee: "Sarah Martinez",
    status: "todo",
    description: "Enhance user interface with modern design patterns",
    statusUpdates: [],
  },
];

const getTimeUntilDeadline = () => {
  const now = new Date();
  const cstNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  
  const deadline = new Date(cstNow);
  deadline.setHours(12, 0, 0, 0);
  
  // If past 12pm today, set to 12pm tomorrow
  if (cstNow.getHours() >= 12) {
    deadline.setDate(deadline.getDate() + 1);
  }
  
  const diff = deadline.getTime() - cstNow.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isPastDeadline: diff < 0 };
};

export default function SprintStandup() {
  const [tickets, setTickets] = useState<JiraTicket[]>(mockTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilDeadline());
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Update countdown timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilDeadline());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");

      setStatusText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      toast({
        title: "Speech recognition error",
        description: "Please try again or type your update manually.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

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
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);
    try {
      const response = await apiRequest("POST", "/api/refine-text", {
        text: statusText,
      });
      setStatusText(response.refinedText);
      toast({
        title: "Text refined",
        description: "Your status update has been improved.",
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

  const handleAddStatus = () => {
    if (!selectedTicketId) {
      toast({
        title: "No ticket selected",
        description: "Please select a ticket first.",
        variant: "destructive",
      });
      return;
    }

    if (!statusText.trim()) {
      toast({
        title: "No status text",
        description: "Please enter a status update.",
        variant: "destructive",
      });
      return;
    }

    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === selectedTicketId
          ? { ...ticket, statusUpdates: [...ticket.statusUpdates, statusText] }
          : ticket
      )
    );

    setStatusText("");
    toast({
      title: "Status added",
      description: "Your status update has been added to the ticket.",
    });
  };

  const handleSendEmail = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const subject = `Sprint Standup Summary - ${dateStr}`;
    
    let body = `Sprint Standup Summary - ${dateStr}\n\n`;
    body += "=".repeat(50) + '\n\n';
    
    const todoTickets = tickets.filter(t => t.status === 'todo');
    const inProgressTickets = tickets.filter(t => t.status === 'inprogress');
    const completeTickets = tickets.filter(t => t.status === 'complete');
    
    body += `TO DO (${todoTickets.length}):\n`;
    todoTickets.forEach(ticket => {
      body += `\n[${ticket.key}] ${ticket.title}\n`;
      body += `  Assignee: ${ticket.assignee}\n`;
      if (ticket.statusUpdates.length > 0) {
        body += `  Updates:\n`;
        ticket.statusUpdates.forEach(update => {
          body += `    - ${update}\n`;
        });
      }
    });
    
    body += "\n" + "=".repeat(50) + "\n\n";
    body += `IN PROGRESS (${inProgressTickets.length}):\n`;
    inProgressTickets.forEach(ticket => {
      body += `\n[${ticket.key}] ${ticket.title}\n`;
      body += `  Assignee: ${ticket.assignee}\n`;
      if (ticket.statusUpdates.length > 0) {
        body += `  Updates:\n`;
        ticket.statusUpdates.forEach(update => {
          body += `    - ${update}\n`;
        });
      }
    });
    
    body += "\n" + "=".repeat(50) + "\n\n";
    body += `COMPLETE (${completeTickets.length}):\n`;
    completeTickets.forEach(ticket => {
      body += `\n[${ticket.key}] ${ticket.title}\n`;
      body += `  Assignee: ${ticket.assignee}\n`;
      if (ticket.statusUpdates.length > 0) {
        body += `  Updates:\n`;
        ticket.statusUpdates.forEach(update => {
          body += `    - ${update}\n`;
        });
      }
    });
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    toast({
      title: "Opening email client",
      description: "Your standup summary is ready to send.",
      duration: 4000,
    });
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const ticketsByStatus = {
    todo: tickets.filter(t => t.status === 'todo'),
    inprogress: tickets.filter(t => t.status === 'inprogress'),
    complete: tickets.filter(t => t.status === 'complete'),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with countdown and email button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Sprint Standup Board
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track sprint tickets and add status updates
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-md" data-testid="countdown-timer">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Until 12pm CST</div>
                <div className="text-lg font-semibold text-foreground">
                  {timeRemaining.hours}h {timeRemaining.minutes}m
                </div>
              </div>
            </div>
            
            {/* Send Email Button */}
            <Button
              onClick={handleSendEmail}
              variant="default"
              data-testid="button-send-email"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Summary
            </Button>
          </div>
        </div>

        {/* Kanban Board - 3 columns */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* To Do Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <h3 className="text-sm font-semibold text-foreground">
                TO DO ({ticketsByStatus.todo.length})
              </h3>
            </div>
            <div className="space-y-3">
              {ticketsByStatus.todo.map(ticket => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer hover-elevate active-elevate-2 transition-all ${
                    selectedTicketId === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  data-testid={`ticket-${ticket.key}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {ticket.key}
                      </Badge>
                      {ticket.statusUpdates.length > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ticket.assignee}
                    </p>
                    {ticket.statusUpdates.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {ticket.statusUpdates.length} update{ticket.statusUpdates.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <h3 className="text-sm font-semibold text-foreground">
                IN PROGRESS ({ticketsByStatus.inprogress.length})
              </h3>
            </div>
            <div className="space-y-3">
              {ticketsByStatus.inprogress.map(ticket => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer hover-elevate active-elevate-2 transition-all ${
                    selectedTicketId === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  data-testid={`ticket-${ticket.key}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {ticket.key}
                      </Badge>
                      {ticket.statusUpdates.length > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ticket.assignee}
                    </p>
                    {ticket.statusUpdates.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {ticket.statusUpdates.length} update{ticket.statusUpdates.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Complete Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <h3 className="text-sm font-semibold text-foreground">
                COMPLETE ({ticketsByStatus.complete.length})
              </h3>
            </div>
            <div className="space-y-3">
              {ticketsByStatus.complete.map(ticket => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer hover-elevate active-elevate-2 transition-all ${
                    selectedTicketId === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  data-testid={`ticket-${ticket.key}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {ticket.key}
                      </Badge>
                      {ticket.statusUpdates.length > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {ticket.assignee}
                    </p>
                    {ticket.statusUpdates.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {ticket.statusUpdates.length} update{ticket.statusUpdates.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Ticket Details & Status Input */}
        <Card className="sticky bottom-0">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedTicket ? (
                <>
                  Add Status Update for{" "}
                  <span className="text-primary">{selectedTicket.key}</span> -{" "}
                  {selectedTicket.title}
                </>
              ) : (
                "Select a ticket to add status update"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket && selectedTicket.statusUpdates.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <div className="text-xs font-semibold text-foreground mb-2">
                  Previous Updates:
                </div>
                <div className="space-y-1">
                  {selectedTicket.statusUpdates.map((update, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {update}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder={
                    selectedTicket
                      ? "Add a status update..."
                      : "Select a ticket first"
                  }
                  className="min-h-[80px] resize-none"
                  disabled={!selectedTicket}
                  data-testid="input-status-text"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={toggleRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  disabled={!selectedTicket}
                  data-testid="button-speech-to-text"
                >
                  {isRecording ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  onClick={handleRefineText}
                  variant="outline"
                  size="icon"
                  disabled={!statusText?.trim() || isRefining}
                  data-testid="button-refine-text"
                >
                  {isRefining ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  onClick={handleAddStatus}
                  disabled={!selectedTicket || !statusText?.trim()}
                  data-testid="button-add-status"
                >
                  Add Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
