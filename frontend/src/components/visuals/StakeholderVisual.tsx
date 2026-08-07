import React from 'react';
import type { VisualTemplateProps } from './types';

const StakeholderVisual: React.FC<VisualTemplateProps> = ({ isNL, visualData }) => {
  const categories = visualData?.categories || [
    { title: isNL ? 'Hoog Belang + Hoge Invloed' : 'High Interest + High Power', description: isNL ? 'Nauw betrekken en tevreden houden' : 'Closely manage and keep satisfied', icon: '⭐', color: 'red' },
    { title: isNL ? 'Laag Belang + Hoge Invloed' : 'Low Interest + High Power', description: isNL ? 'Tevreden houden, regelmatig informeren' : 'Keep satisfied, inform regularly', icon: '👁️', color: 'orange' },
    { title: isNL ? 'Hoog Belang + Lage Invloed' : 'High Interest + Low Power', description: isNL ? 'Goed informeren en betrekken' : 'Keep informed and engaged', icon: '📣', color: 'blue' },
    { title: isNL ? 'Laag Belang + Lage Invloed' : 'Low Interest + Low Power', description: isNL ? 'Monitoren, minimale inspanning' : 'Monitor, minimal effort', icon: '📋', color: 'gray' },
  ];

  const colorMap: Record<string, { bg: string; border: string; gradient: string }> = {
    red: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-300 dark:border-red-800', gradient: 'from-red-500 to-pink-500' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300 dark:border-orange-800', gradient: 'from-orange-500 to-amber-500' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-300 dark:border-blue-800', gradient: 'from-blue-500 to-cyan-500' },
    gray: { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-300 dark:border-gray-700', gradient: 'from-gray-400 to-gray-500' },
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold mb-2">{'🎯 Stakeholder Matrix'}</h3>
        <p className="opacity-90">{isNL ? 'Wie zijn je stakeholders en hoe ga je met ze om?' : 'Who are your stakeholders and how do you manage them?'}</p>
      </div>

      {/* 2x2 Matrix */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, i) => {
          const c = colorMap[cat.color || 'gray'] || colorMap.gray;
          return (
            <div key={i} className={`${c.bg} p-6 rounded-2xl border-2 ${c.border} hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${c.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{cat.icon}</span>
                </div>
                <h4 className="font-bold text-sm">{isNL && cat.titleNL ? cat.titleNL : cat.title}</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{isNL && cat.descriptionNL ? cat.descriptionNL : cat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Axis Labels */}
      <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><span>←</span>{isNL ? 'Lage Invloed' : 'Low Power'}</span>
        <span className="font-bold">{isNL ? 'INVLOED' : 'POWER'}</span>
        <span className="flex items-center gap-1">{isNL ? 'Hoge Invloed' : 'High Power'}<span>→</span></span>
      </div>
    </div>
  );
};

export default StakeholderVisual;