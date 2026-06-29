import React from 'react';
import type { VisualTemplateProps } from './types';

const TripleConstraintVisual: React.FC<VisualTemplateProps> = ({ isNL, visualData }) => {
  const nodes = visualData?.nodes || [
    { label: isNL ? 'TIJD' : 'TIME', tooltip: isNL ? 'Hoelang duurt het?' : 'How long?' },
    { label: 'BUDGET', tooltip: isNL ? 'Hoeveel mag het kosten?' : 'How much?' },
    { label: 'SCOPE', tooltip: isNL ? 'Wat moet het opleveren?' : 'What to deliver?' },
  ];

  const scenarios = visualData?.scenarios || [
    {
      title: isNL ? 'Minder Tijd?' : 'Less Time?',
      icon: '⚠️',
      color: 'red',
      description: isNL
        ? 'Dan heb je <strong class="text-red-600">meer budget</strong> nodig (extra mensen) OF moet je <strong class="text-red-600">minder features</strong> opleveren.'
        : 'Then you need <strong class="text-red-600">more budget</strong> (extra people) OR must deliver <strong class="text-red-600">fewer features</strong>.',
      example: isNL ? '6 → 4 maanden = +€20k budget' : '6 → 4 months = +€20k budget',
    },
    {
      title: isNL ? 'Minder Budget?' : 'Less Budget?',
      icon: '💰',
      color: 'orange',
      description: isNL
        ? 'Dan duurt het <strong class="text-orange-600">langer</strong> (minder mensen) OF lever je <strong class="text-orange-600">minder features</strong> op.'
        : 'Then it takes <strong class="text-orange-600">longer</strong> (fewer people) OR you deliver <strong class="text-orange-600">fewer features</strong>.',
      example: isNL ? '€100k → €70k = +2 maanden' : '€100k → €70k = +2 months',
    },
    {
      title: isNL ? 'Meer Features?' : 'More Features?',
      icon: '🎯',
      color: 'purple',
      description: isNL
        ? 'Dan heb je <strong class="text-purple-600">meer tijd</strong> EN/OF <strong class="text-purple-600">meer budget</strong> nodig!'
        : 'Then you need <strong class="text-purple-600">more time</strong> AND/OR <strong class="text-purple-600">more budget</strong>!',
      example: isNL ? '20 → 40 features = 2x tijd/budget' : '20 → 40 features = 2x time/budget',
    },
  ];

  const scenarioColors: Record<string, { border: string; gradient: string; text: string }> = {
    red: { border: 'border-red-200 dark:border-red-800 hover:border-red-500', gradient: 'from-red-500 to-pink-500', text: 'text-red-600' },
    orange: { border: 'border-orange-200 dark:border-orange-800 hover:border-orange-500', gradient: 'from-orange-500 to-red-500', text: 'text-orange-600' },
    purple: { border: 'border-purple-200 dark:border-purple-800 hover:border-purple-500', gradient: 'from-purple-500 to-pink-500', text: 'text-purple-600' },
  };

  const nodeGradients = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
  ];

  const nodeIcons = [
    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-3xl font-bold mb-3">{isNL ? '⚖️ De Magische Driehoek' : '⚖️ The Magic Triangle'}</h3>
        <p className="text-lg opacity-90">{isNL ? 'Verander 1 kant, beïnvloed de andere 2!' : 'Change 1 side, affect the other 2!'}</p>
      </div>

      {/* Triangle Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-12 rounded-2xl">
        <div className="relative mx-auto" style={{ maxWidth: 500 }}>
          <svg viewBox="0 0 400 350" className="w-full">
            <defs>
              <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.3 }} />
                <stop offset="50%" style={{ stopColor: '#ef4444', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.3 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <polygon points="200,50 370,300 30,300" fill="url(#triGrad)" stroke="#f97316" strokeWidth="4" filter="url(#glow)" />
            <line x1="200" y1="50" x2="200" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
            <line x1="30" y1="300" x2="370" y2="300" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
            <line x1="30" y1="300" x2="200" y2="50" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
          </svg>

          {/* Time Node (Top) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
            <div className="group relative">
              <div className={`w-24 h-24 bg-gradient-to-br ${nodeGradients[0]} rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer`}>
                <svg className="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={nodeIcons[0]} />
                </svg>
                <span className="text-white font-bold text-sm">{nodes[0]?.label}</span>
              </div>
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 text-white text-xs p-2 rounded-lg text-center shadow-lg">{nodes[0]?.tooltip}</div>
              </div>
            </div>
          </div>

          {/* Budget Node (Bottom Left) */}
          <div className="absolute bottom-0 left-0 translate-y-4 -translate-x-6">
            <div className="group relative">
              <div className={`w-24 h-24 bg-gradient-to-br ${nodeGradients[1]} rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer`}>
                <svg className="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={nodeIcons[1]} />
                </svg>
                <span className="text-white font-bold text-sm">{nodes[1]?.label}</span>
              </div>
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-green-600 text-white text-xs p-2 rounded-lg text-center shadow-lg">{nodes[1]?.tooltip}</div>
              </div>
            </div>
          </div>

          {/* Scope Node (Bottom Right) */}
          <div className="absolute bottom-0 right-0 translate-y-4 translate-x-6">
            <div className="group relative">
              <div className={`w-24 h-24 bg-gradient-to-br ${nodeGradients[2]} rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer`}>
                <svg className="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={nodeIcons[2]} />
                </svg>
                <span className="text-white font-bold text-sm text-center px-1">{nodes[2]?.label}</span>
              </div>
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-purple-600 text-white text-xs p-2 rounded-lg text-center shadow-lg">{nodes[2]?.tooltip}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenarios */}
      <div className="grid md:grid-cols-3 gap-6">
        {scenarios.map((scenario, i) => {
          const sc = scenarioColors[scenario.color || 'red'] || scenarioColors.red;
          return (
            <div key={i} className={`group bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 ${sc.border} hover:shadow-xl transition-all`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${sc.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{scenario.icon}</span>
                </div>
                <h5 className="font-bold text-lg">{isNL && scenario.titleNL ? scenario.titleNL : scenario.title}</h5>
              </div>
              <p
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: isNL && scenario.descriptionNL ? scenario.descriptionNL : scenario.description }}
              />
              {(scenario.example || scenario.exampleNL) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className={`text-xs font-semibold ${sc.text} mb-1`}>{isNL ? '📌 Voorbeeld:' : '📌 Example:'}</div>
                  <div className="text-xs text-gray-500">{isNL && scenario.exampleNL ? scenario.exampleNL : scenario.example}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real Business Case */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h5 className="text-2xl font-bold">{isNL ? '🏢 Echte Business Case' : '🏢 Real Business Case'}</h5>
              <p className="opacity-90">Website Redesign Project</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-sm font-semibold mb-3 opacity-90">{isNL ? '📊 ORIGINEEL PLAN' : '📊 ORIGINAL PLAN'}</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">⏱️</span><span>{isNL ? '3 maanden' : '3 months'}</span></div>
                <div className="flex items-center gap-2"><span className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">💰</span><span>€50.000</span></div>
                <div className="flex items-center gap-2"><span className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">🎯</span><span>{isNL ? "20 pagina's" : '20 pages'}</span></div>
              </div>
            </div>
            <div className="bg-red-500/30 backdrop-blur rounded-xl p-6 border-2 border-red-400/50">
              <div className="text-sm font-semibold mb-3">{isNL ? '⚠️ WIJZIGING' : '⚠️ CHANGE'}</div>
              <div className="font-bold text-lg mb-2">{isNL ? "CEO wil 40 pagina's!" : 'CEO wants 40 pages!'}</div>
              <div className="text-sm opacity-90">{isNL ? '(2x meer scope 🎯)' : '(2x more scope 🎯)'}</div>
            </div>
            <div className="bg-green-500/30 backdrop-blur rounded-xl p-6 border-2 border-green-400/50">
              <div className="text-sm font-semibold mb-3">{isNL ? '✅ OPTIES' : '✅ OPTIONS'}</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="text-green-300">A.</span><span>{isNL ? '6 maanden (2x tijd)' : '6 months (2x time)'}</span></div>
                <div className="flex items-center gap-2"><span className="text-green-300">B.</span><span>{'€100k (2x budget)'}</span></div>
                <div className="flex items-center gap-2"><span className="text-green-300">C.</span><span>{isNL ? "30 pagina's (compromis)" : '30 pages (compromise)'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripleConstraintVisual;