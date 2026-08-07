import React from 'react';
import type { VisualTemplateProps } from './types';

const ComparisonVisual: React.FC<VisualTemplateProps> = ({ isNL, visualData }) => {
  const items = visualData?.items || [
    { label: isNL ? 'Duur' : 'Duration', project: isNL ? 'Tijdelijk (begin & einde)' : 'Temporary (start & end)', operation: isNL ? 'Doorlopend' : 'Ongoing' },
    { label: isNL ? 'Doel' : 'Goal', project: isNL ? 'Uniek resultaat' : 'Unique result', operation: isNL ? 'Herhaalbaar proces' : 'Repeatable process' },
    { label: 'Team', project: isNL ? 'Wisselend, multidisciplinair' : 'Changing, multidisciplinary', operation: isNL ? 'Vast team' : 'Fixed team' },
    { label: isNL ? 'Risico' : 'Risk', project: isNL ? 'Hoog (onzekerheid)' : 'High (uncertainty)', operation: isNL ? 'Laag (voorspelbaar)' : 'Low (predictable)' },
    { label: 'Budget', project: isNL ? 'Vast budget, eenmalig' : 'Fixed budget, one-time', operation: isNL ? 'Terugkerend budget' : 'Recurring budget' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold mb-2">{isNL ? '⚔️ Project vs. Operatie' : '⚔️ Project vs. Operation'}</h3>
        <p className="opacity-90">{isNL ? 'Twee fundamenteel verschillende werkvormen — ken het verschil!' : 'Two fundamentally different work forms — know the difference!'}</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr>
              <th className="bg-gray-100 dark:bg-gray-800 p-4 text-left text-sm font-bold text-gray-500 dark:text-gray-400 w-1/5" />
              <th className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-center text-white font-bold w-2/5">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span>{'PROJECT'}</span>
                </div>
              </th>
              <th className="bg-gradient-to-r from-gray-500 to-gray-600 p-4 text-center text-white font-bold w-2/5">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">⚙️</span>
                  <span>{isNL ? 'OPERATIE' : 'OPERATION'}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                <td className="p-4 font-semibold text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                  {isNL && item.labelNL ? item.labelNL : item.label}
                </td>
                <td className="p-4 text-sm text-blue-700 dark:text-blue-300 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    {isNL && item.projectNL ? item.projectNL : item.project}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full shrink-0" />
                    {isNL && item.operationNL ? item.operationNL : item.operation}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Examples */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
          <h5 className="font-bold text-blue-700 dark:text-blue-300 mb-3">{isNL ? '✅ Project Voorbeelden' : '✅ Project Examples'}</h5>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2"><span>🏗️</span>{isNL ? 'Nieuw kantoor bouwen' : 'Building a new office'}</li>
            <li className="flex items-center gap-2"><span>💻</span>{isNL ? 'App ontwikkelen' : 'Developing an app'}</li>
            <li className="flex items-center gap-2"><span>🎓</span>{isNL ? 'Trainingsprogramma lanceren' : 'Launching a training program'}</li>
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3">{isNL ? '⚙️ Operatie Voorbeelden' : '⚙️ Operation Examples'}</h5>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2"><span>📞</span>{isNL ? 'Klantenservice runnen' : 'Running customer service'}</li>
            <li className="flex items-center gap-2"><span>📦</span>{isNL ? 'Dagelijkse productie' : 'Daily production'}</li>
            <li className="flex items-center gap-2"><span>🔧</span>{isNL ? 'Systeem onderhoud' : 'System maintenance'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComparisonVisual;