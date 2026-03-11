import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, ArrowLeft, Sparkles } from "lucide-react";
import AISmartHelper from "@/components/governance/AISmartHelper";
import { Badge } from "@/components/ui/badge";
import { usePageTranslations } from '@/hooks/usePageTranslations';

const CreatePortfolio: React.FC = () => {
  const { pt } = usePageTranslations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const handleAISuggestion = (suggestion: any) => {
    setFormData({
      ...formData,
      ...suggestion,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      if (!user?.company) {
        toast({
          title: "❌ Missing Company",
          description: "Your account is not associated with a company.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const payload = {
        ...formData,
        company: user.company,
        owner: user.id,
      };
      
      const response = await fetch("/api/v1/governance/portfolios/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create portfolio");

      const data = await response.json();

      toast({
        title: "✅ Portfolio Created",
        description: `${formData.name} has been created successfully.`,
      });

      navigate("/governance/portfolios");
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to create portfolio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20">
      <div className="absolute top-0 -left-4 w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-[28rem] h-[28rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="relative z-10 p-8 md:p-10 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/governance/portfolios")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {pt("Back to Portfolios")}
          </Button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span>📊 {pt("Create Portfolio")}</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {pt("New Strategic Portfolio")}
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {pt("Create a portfolio to manage strategic initiatives and governance")}
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-purple-100 dark:border-purple-900/30">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              {pt("Portfolio Details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <AISmartHelper
              type="portfolio"
              onSuggestion={handleAISuggestion}
            />
            
            <div className="h-6" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  {pt("Portfolio Name")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={pt("e.g., Digital Transformation Portfolio")}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  {pt("Description")}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={pt("Describe the strategic objectives and scope of this portfolio...")}
                  rows={6}
                  className="text-base"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/governance/portfolios")}
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  {pt("Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      {pt("Creating...")}
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      {pt("Create Portfolio")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePortfolio;
