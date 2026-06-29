import React from 'react';
import type { VisualTemplateProps } from './types';

const LifecycleVisual: React.FC<VisualTemplateProps> = ({ isNL, visualData }) => {
  const phases = visualData?.phases || [
    { name: isNL ? 'Initiatie' : 'Initiation', description: isNL ? 'Project definiëren, business case, stakeholders' : 'Define project, business case, stakeholders', color: 'blue' },
    { name: 'Planning', description: isNL ? 'Scope, planning, budget, risicoanalyse' : 'Scope, schedule, budget, risk analysis', color: 'purple' },
    { name: isNL ? 'Uitvoering' : 'Execution', description: isNL ? 'Team aansturen, deliverables opleveren' : 'Lead team, deliver deliverables', color: 'green' },
    { name: isNL ? 'Bewaking' : 'Monitoring', description: isNL ? 'Voortgang meten, bijsturen, rapporteren' : 'Measure progress, adjust, report', color: 'orange' },
    { name: isNL ? 'Afsluiting' : 'Closing', description: isNL ? 'Oplevering, evaluatie, lessons learned' : 'Delivery, evaluation, lessons learned', color: 'red' },
  ];

  const phaseColors: Record<string, { gradient: string; bg: string; text: string; ring: string }> = {
    blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600', ring: 'ring-blue-500' },
    purple: { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600', ring: 'ring-purple-500' },
    green: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600', ring: 'ring-green-500' },
    orange: { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600', ring: 'ring-orange-500' },
    red: { gradient: 'from-red-500 to-pink-500', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600', ring: 'ring-red-500' },
  };

  const phaseIcons = ['🚀', '📋', '⚡', '📊', '🏁'];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold mb-2">{isNL ? '🔄 Projectlevenscyclus' : '🔄 Project Lifecycle'}</h3>
        <p className="opacity-90">{isNL ? 'Elk project doorloopt deze 5 fasen' : 'Every project goes through these 5 phases'}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-8 top-12 bottom-12 w-1 bg-gradient-to-b from-blue-500 via-green-500 to-red-500 rounded-full hidden md:block" />

        <div className="space-y-6">
          {phases.map((phase, i) => {
            const c = phaseColors[phase.color || 'blue'] || phaseColors.blue;
            return (
              <div key={i} className="flex items-start gap-6 group">
                {/* Phase number circle */}
                <div className={`w-16 h-16 bg-gradient-to-br ${c.gradient} rounded-2xl flex flex-col items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform z-10`}>
                  <span className="text-2xl">{phaseIcons[i]}</span>
                </div>

                {/* Phase content */}
                <div className={`flex-1 ${c.bg} p-6 rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:shadow-lg transition-shadow`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold uppercase ${c.text}`}>{isNL ? `Fase ${i + 1}` : `Phase ${i + 1}`}</span>
                    {i === 0 && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">START</span>}
                    {i === phases.length - 1 && <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">EINDE</span>}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{isNL && phase.nameNL ? phase.nameNL : phase.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isNL && phase.descriptionNL ? phase.descriptionNL : phase.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LifecycleVisual;