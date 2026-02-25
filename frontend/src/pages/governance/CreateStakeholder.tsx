import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, ArrowLeft, Sparkles } from "lucide-react";
import AISmartHelper from "@/components/governance/AISmartHelper";
import { usePageTranslations } from '@/hooks/usePageTranslations';

const CreateStakeholder: React.FC = () => {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pt } = usePageTranslations();
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "key_stakeholder",
    organization: "",
    portfolio: "",
    interest_level: "medium",
    influence_level: "medium",
  });

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/governance/portfolios/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPortfolios(data.results || data);
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
    }
  };

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
      const validRoles = ["executive_sponsor", "senior_responsible_owner", "business_change_manager", "project_executive", "key_stakeholder"];
      const payload = {
        ...formData,
        role: validRoles.includes(formData.role) ? formData.role : "key_stakeholder",
      };
      // Remove empty optional fields
      if (!payload.organization) delete payload.organization;
      if (!payload.portfolio) delete payload.portfolio;
      console.log("Sending payload:", payload);
      
      const response = await fetch("/api/v1/governance/stakeholders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Stakeholder error:", err);
        throw new Error(JSON.stringify(err));
      }

      toast({
        title: "✅ Stakeholder Added",
        description: `${formData.name} has been added successfully.`,
      });

      navigate("/governance/stakeholders");
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add stakeholder. Please try again.",
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
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/governance/stakeholders")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {pt("Back to Stakeholders")}
          </Button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span>👥 {pt("Add Stakeholder")}</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {pt("New Stakeholder")}
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {pt("Add a stakeholder to your governance portfolio")}
          </p>
        </div>

        <Card className="border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-purple-100 dark:border-purple-900/30">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              {pt("Stakeholder Details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <AISmartHelper
              type="stakeholder"
              onSuggestion={handleAISuggestion}
            />
            
            <div className="h-6" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-base font-semibold">
                  {pt("Portfolio")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.portfolio}
                  onValueChange={(value) => setFormData({ ...formData, portfolio: value })}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={pt("Select a portfolio")} />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    {pt("Name")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    {pt("Email")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={pt("john@example.com")}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-base font-semibold">
                    {pt("Role")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={pt("Select role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive_sponsor">{pt("Executive Sponsor")}</SelectItem>
                      <SelectItem value="senior_responsible_owner">{pt("Senior Responsible Owner")}</SelectItem>
                      <SelectItem value="business_change_manager">{pt("Business Change Manager")}</SelectItem>
                      <SelectItem value="project_executive">{pt("Project Executive")}</SelectItem>
                      <SelectItem value="key_stakeholder">{pt("Key Stakeholder")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-base font-semibold">
                    {pt("Organization")}
                  </Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder={pt("Company name")}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="interest" className="text-base font-semibold">
                    {pt("Interest Level")}
                  </Label>
                  <Select
                    value={formData.interest_level}
                    onValueChange={(value) => setFormData({ ...formData, interest_level: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{pt("Low")}</SelectItem>
                      <SelectItem value="medium">{pt("Medium")}</SelectItem>
                      <SelectItem value="high">{pt("High")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="influence" className="text-base font-semibold">
                    {pt("Influence Level")}
                  </Label>
                  <Select
                    value={formData.influence_level}
                    onValueChange={(value) => setFormData({ ...formData, influence_level: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{pt("Low")}</SelectItem>
                      <SelectItem value="medium">{pt("Medium")}</SelectItem>
                      <SelectItem value="high">{pt("High")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/governance/stakeholders")}
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  {pt("Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.email || !formData.portfolio}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      {pt("Adding...")}
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      {pt("Add Stakeholder")}
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

export default CreateStakeholder;
