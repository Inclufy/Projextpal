import ExecutiveDashboard from "@/components/dashboards/ExecutiveDashboard";
import ProgramManagerDashboard from "@/components/dashboards/ProgramManagerDashboard";
import ProjectManagerDashboard from "@/components/dashboards/ProjectManagerDashboard";
import TeamMemberDashboard from "@/components/dashboards/TeamMemberDashboard";

import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
  Target,
  Crown,
  Zap,
  Trello,
  Waves,
  GitMerge,
  Layers,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreditCard, ArrowUpRight, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTranslations } from '@/hooks/usePageTranslations';

const fetchProjects = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/projects/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
};

const fetchPrograms = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/programs/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch programs");
  return response.json();
};

const callAI = async (prompt: string, language: "en" | "nl" = "nl"): Promise<string> => {
  const token = localStorage.getItem("access_token");
  try {
    const createChatResponse = await fetch("/api/v1/bot/chats/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Dashboard AI Summary" }),
    });
    if (!createChatResponse.ok) throw new Error("Failed to create chat");
    const chatData = await createChatResponse.json();
    const messageResponse = await fetch(`/api/v1/bot/chats/${chatData.id}/send_message/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: prompt, language }),
    });
    if (!messageResponse.ok) throw new Error("AI service unavailable");
    const data = await messageResponse.json();
    return data.ai_response?.content || "";
  } catch (error) {
    throw error;
  }
};

// Luxe Lucide Icons voor frameworks
const methodologyIcons: Record<string, { icon: any; label: string; color: string }> = {
  'prince2': { icon: Crown, label: 'PRINCE2', color: 'text-indigo-600' },
  'agile': { icon: Zap, label: 'Agile', color: 'text-orange-600' },
  'scrum': { icon: Target, label: 'Scrum', color: 'text-blue-600' },
  'kanban': { icon: Trello, label: 'Kanban', color: 'text-cyan-600' },
  'waterfall': { icon: Waves, label: 'Waterfall', color: 'text-teal-600' },
  'hybrid': { icon: GitMerge, label: 'Hybrid', color: 'text-pink-600' },
  'msp': { icon: Layers, label: 'MSP', color: 'text-purple-600' },
  'safe': { icon: Sparkles, label: 'SAFe', color: 'text-amber-600' },
  'pmi': { icon: BarChart3, label: 'PMI', color: 'text-emerald-600' },
  'sixsigma': { icon: Sparkles, label: 'Six Sigma', color: 'text-green-600' },
};

interface DonutChartProps {
  total: number;
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
}

const DonutChart = ({ total, segments, centerLabel }: DonutChartProps) => {
  const { pt } = usePageTranslations();
  const radius = 80;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  let currentOffset = 0;
  
  return (
    <div className="inline-flex flex-col items-center justify-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-purple-100 dark:text-purple-900/30"
          />
          {segments.map((segment, index) => {
            const percentage = total > 0 ? (segment.value / total) * 100 : 0;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (percentage / 100) * circumference;

            return (
              <circle
                key={index}
                stroke={segment.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out drop-shadow-sm"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">{total}</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest mt-2">{centerLabel}</span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    'planning': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 ring-1 ring-inset ring-purple-600/20',
    'in_progress': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20',
    'active': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20',
    'completed': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 ring-1 ring-inset ring-green-600/20',
    'on_hold': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20',
    'pending': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 ring-1 ring-inset ring-orange-600/20',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${statusStyles[status?.toLowerCase()] || statusStyles['planning']}`}>
      {status || 'planning'}
    </span>
  );
};

const HealthIndicator = ({ health }: { health?: string }) => {
  const healthColors: Record<string, string> = {
    'healthy': 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30',
    'good': 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30',
    'at_risk': 'bg-amber-500 ring-amber-100 dark:ring-amber-900/30',
    'critical': 'bg-red-500 ring-red-100 dark:ring-red-900/30',
  };
  
  return (
    <div className={`h-2.5 w-2.5 rounded-full ring-4 ${healthColors[health?.toLowerCase() || 'healthy'] || 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30'}`} />
  );
};

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  trendValue,
  color = 'purple' 
}: any) => {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    emerald: 'from-emerald-600 to-teal-600',
    red: 'from-red-600 to-rose-600',
    amber: 'from-amber-600 to-orange-600',
  };

  return (
    <Card className="relative overflow-hidden border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:ring-purple-200 dark:hover:ring-purple-800/50 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/50 dark:from-purple-900/10 dark:via-transparent dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-7 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20' : 
              'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 ring-1 ring-inset ring-red-600/20'
            }`}>
              <TrendingUp className={`h-3.5 w-3.5 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
            {title}
          </p>
          <h3 className={`text-4xl font-bold bg-gradient-to-br ${colorClasses[color]} bg-clip-text text-transparent leading-none`}>
            {value}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const CurrentPlanCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { pt } = usePageTranslations();
  
  const tier = user?.subscription?.tier || 'trial';
  const status = user?.subscription?.status || 'pending';
  const isTrial = tier === 'trial';
  
  const tierNames: Record<string, string> = {
    trial: 'Trial',
    starter: 'Starter',
    professional: 'Professional',
    team: 'Team',
    enterprise: 'Enterprise'
  };

  const handleClick = () => {
    if (isTrial) {
      navigate('/profile?tab=subscription&action=upgrade');
    } else {
      navigate('/profile?tab=subscription');
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      <CardContent className="p-7 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                {pt("Current Plan")}
              </p>
              <h3 className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {tierNames[tier]}
              </h3>
            </div>
          </div>
          <Badge variant={status === 'active' ? 'default' : 'secondary'} className="uppercase text-xs">
            {status}
          </Badge>
        </div>

        {isTrial && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              {pt("Limited features • Upgrade to unlock full potential")}
            </p>
          </div>
        )}

        <Button 
          onClick={handleClick}
          className={`w-full font-bold rounded-xl transition-all duration-300 ${
            isTrial 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-2 ring-inset ring-purple-200 dark:ring-purple-800 hover:ring-purple-300 dark:hover:ring-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20'
          }`}
        >
          {isTrial ? (
            <>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              {pt("Upgrade Plan")}
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              {pt("Manage Subscription")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  // Role-based dashboard routing
  const userRole = localStorage.getItem("user_role");
  
  // PM gets Project Manager Dashboard
  if (userRole === "pm") {
    return <ProjectManagerDashboard />;
  }
  
  // Program Manager gets Program Manager Dashboard
  if (userRole === "program_manager") {
    return <ProgramManagerDashboard />;
  }
  
  // Admin and SuperAdmin get Executive Dashboard
  if (userRole === "admin" || userRole === "superadmin") {
    return <ExecutiveDashboard />;
  }
  
  // Everyone else (guest, reviewer, member, etc.) gets Team Member Dashboard
  return <TeamMemberDashboard />;
};

export default Index;
