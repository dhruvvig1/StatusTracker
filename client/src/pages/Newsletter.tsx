import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, Newspaper } from "lucide-react";

export default function Newsletter() {
  const [newsletter, setNewsletter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateNewsletter = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("GET", "/api/newsletter");
      setNewsletter(response.newsletter);
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
      setIsGenerating(false);
    }
  };

  const handleSendEmail = () => {
    const today = new Date();
    const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const subject = `Project Status Newsletter - ${monthYear}`;
    const body = newsletter;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    toast({
      title: "Opening email client",
      description: "Your default email application will open with the newsletter content.",
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Monthly Newsletter
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Generate AI-powered summary of all projects from the last 30 days
            </p>
          </div>
          
          <Button
            onClick={handleGenerateNewsletter}
            disabled={isGenerating}
            variant="default"
            data-testid="button-generate-newsletter"
          >
            {isGenerating ? (
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
        </div>

        {newsletter ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Newsletter Preview</CardTitle>
                <Button
                  onClick={handleSendEmail}
                  variant="outline"
                  data-testid="button-send-email"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send via Email
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted p-4 rounded-md">
                  {newsletter}
                </pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Newsletter Generated Yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the button above to generate an AI-powered newsletter summarizing
                  all project updates from the last 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
