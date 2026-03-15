import React from 'react';
import type { VisualTemplateProps } from './types';

const MethodologyVisual: React.FC<VisualTemplateProps> = ({ isNL, visualData }) => {
  const methodologies = visualData?.cards || [
    {
      title: 'Waterfall',
      description: isNL
        ? 'Lineair en sequentieel. Elke fase moet afgerond zijn voordat de volgende begint. Geschikt voor projecten met vaste eisen.'
        : 'Linear and sequential. Each phase must be completed before the next begins. Suited for projects with fixed requirements.',
      icon: '🌊',
      color: 'blue',
    },
    {
      title: 'Agile',
      description: isNL
        ? 'Iteratief en flexibel. Werk in korte sprints met continu feedback. Ideaal voor projecten waar eisen kunnen veranderen.'
        : 'Iterative and flexible. Work in short sprints with continuous feedback. Ideal for projects where requirements may change.',
      icon: '🔄',
      color: 'green',
    },
    {
      title: 'Scrum',
      description: isNL
        ? 'Een Agile framework met vaste rollen (Product Owner, Scrum Master, Team), sprints van 2-4 weken en dagelijkse stand-ups.'
        : 'An Agile framework with fixed roles (Product Owner, Scrum Master, Team), 2-4 week sprints and daily stand-ups.',
      icon: '🏉',
      color: 'purple',
    },
    {
      title: 'PRINCE2',
      description: isNL
        ? 'Gestructureerde methode met 7 principes, 7 thema\'s en 7 processen. Populair in Europa en de publieke sector.'
        : 'Structured method with 7 principles, 7 themes and 7 processes. Popular in Europe and the public sector.',
      icon: '👑',
      color: 'orange',
    },
  ];

  const colorMap: Record<string, { gradient: string; border: string; text: string; bg: string }> = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      border: 'border-blue-200 dark:border-blue-800 hover:border-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      border: 'border-green-200 dark:border-green-800 hover:border-green-500',
      text: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      border: 'border-purple-200 dark:border-purple-800 hover:border-purple-500',
      text: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    orange: {
      gradient: 'from-orange-500 to-amber-500',
      border: 'border-orange-200 dark:border-orange-800 hover:border-orange-500',
      text: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold mb-2">
          {isNL ? '📐 Projectmanagement Methodologieën' : '📐 Project Management Methodologies'}
        </h3>
        <p className="opacity-90">
          {isNL
            ? 'Kies de juiste aanpak voor jouw project — van lineair tot iteratief.'
            : 'Choose the right approach for your project — from linear to iterative.'}
        </p>
      </div>

      {/* Spectrum bar: Predictive ← → Adaptive */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {isNL ? '📋 Voorspellend (Plan-gedreven)' : '📋 Predictive (Plan-driven)'}
          </span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {isNL ? '🔄 Adaptief (Waarde-gedreven)' : '🔄 Adaptive (Value-driven)'}
          </span>
        </div>
        <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 shadow-inner" />
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Waterfall</span>
          <span>PRINCE2</span>
          <span>Hybrid</span>
          <span>Scrum</span>
          <span>Agile</span>
        </div>
      </div>

      {/* Methodology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methodologies.map((method, i) => {
          const c = colorMap[method.color || 'blue'] || colorMap.blue;
          return (
            <div
              key={i}
              className={`group bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 ${c.border} hover:shadow-xl transition-all`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${c.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <span className="text-3xl">{method.icon}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold">
                    {isNL && method.titleNL ? method.titleNL : method.title}
                  </h4>
                  <span className={`text-sm ${c.text} font-semibold`}>
                    {isNL ? `Methode ${i + 1}` : `Method ${i + 1}`}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {isNL && method.descriptionNL ? method.descriptionNL : method.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">💡</span>
          <h5 className="font-bold text-lg">{isNL ? 'Onthoud' : 'Remember'}</h5>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          {isNL
            ? 'Er is geen "beste" methodologie — de juiste keuze hangt af van je project, team en organisatie. Veel organisaties gebruiken een hybride aanpak.'
            : 'There is no "best" methodology — the right choice depends on your project, team and organization. Many organizations use a hybrid approach.'}
        </p>
      </div>
    </div>
  );
};

export default MethodologyVisual;
