import React from 'react';
import { Link } from 'react-router-dom';

// Icons as components for cleaner code
const SparkleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
  </svg>
);

const CheckIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);

const ChevronRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
  </svg>
);

const LightningIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);

// Methodology Card Component
interface MethodologyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  bgColor: string;
  visual: React.ReactNode;
  points: { icon: React.ReactNode; text: string }[];
}

const MethodologyCard: React.FC<MethodologyCardProps> = ({
  title,
  description,
  icon,
  badge,
  badgeColor,
  bgColor,
  visual,
  points
}) => (
  <div className="group bg-white rounded-3xl border border-gray-100 shadow-lg p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10">
    <div className="flex items-start justify-between mb-6">
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <span className={`px-3 py-1 ${badgeColor} text-xs font-semibold rounded-full`}>
        {badge}
      </span>
    </div>
    
    <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-6">{description}</p>
    
    {visual}
    
    <div className="space-y-3">
      {points.map((point, index) => (
        <div key={index} className="flex items-center gap-3 text-sm">
          <div className={`w-6 h-6 ${bgColor} rounded-lg flex items-center justify-center`}>
            {point.icon}
          </div>
          <span className="text-gray-700">{point.text}</span>
        </div>
      ))}
    </div>
  </div>
);

// Framework Card Component
interface FrameworkCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgColor: string;
  tags: { label: string; color: string }[];
}

const FrameworkCard: React.FC<FrameworkCardProps> = ({
  title,
  subtitle,
  icon,
  bgColor,
  tags
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm mb-4">{subtitle}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span key={index} className={`px-2 py-1 ${tag.color} text-xs rounded-full font-medium`}>
          {tag.label}
        </span>
      ))}
    </div>
  </div>
);

// Combination Card Component
interface CombinationCardProps {
  title: string;
  subtitle: string;
  icons: { letter: string; bgColor: string; textColor: string }[];
  description: string;
  leftTitle: string;
  leftColor: string;
  leftPoints: string[];
  rightTitle: string;
  rightColor: string;
  rightPoints: string[];
  tags: { label: string; color: string }[];
}

const CombinationCard: React.FC<CombinationCardProps> = ({
  title,
  subtitle,
  icons,
  description,
  leftTitle,
  leftColor,
  leftPoints,
  rightTitle,
  rightColor,
  rightPoints,
  tags
}) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
    <div className="flex items-center gap-4 mb-6">
      <div className="flex -space-x-2">
        {icons.map((icon, index) => (
          <div 
            key={index}
            className={`w-12 h-12 ${icon.bgColor} rounded-xl flex items-center justify-center border-2 border-white`}
            style={{ zIndex: icons.length - index }}
          >
            <span className={`${icon.textColor} font-bold`}>{icon.letter}</span>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
    
    <p className="text-gray-600 mb-6">{description}</p>
    
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className={`${leftColor} font-medium mb-2`}>{leftTitle}</div>
          <ul className="text-gray-600 space-y-1 text-xs">
            {leftPoints.map((point, index) => (
              <li key={index}>• {point}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className={`${rightColor} font-medium mb-2`}>{rightTitle}</div>
          <ul className="text-gray-600 space-y-1 text-xs">
            {rightPoints.map((point, index) => (
              <li key={index}>• {point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span key={index} className={`px-3 py-1 ${tag.color} text-xs font-medium rounded-full`}>
          {tag.label}
        </span>
      ))}
    </div>
  </div>
);

// Main Page Component
const ManagementMethodiekenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/50 via-50% to-pink-50/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold">PX</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                Proje<span className="text-purple-600">X</span>tPal
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#methodieken" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Methodieken
              </a>
              <a href="#programma" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Programma Management
              </a>
              <a href="#combinaties" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                Combinaties
              </a>
              <Link 
                to="/app" 
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Open App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Sparkle Decorations */}
        <SparkleIcon className="absolute top-32 left-[15%] w-4 h-4 text-purple-400 animate-pulse" />
        <SparkleIcon className="absolute top-48 right-[20%] w-3 h-3 text-pink-400 animate-pulse" />
        <SparkleIcon className="absolute bottom-40 left-[25%] w-3 h-3 text-purple-300 animate-pulse" />
        <SparkleIcon className="absolute top-60 right-[10%] w-4 h-4 text-pink-300 animate-pulse" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-purple-100 border border-purple-200 rounded-full mb-8">
            <SparkleIcon className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-700 font-medium">ProjeXtPal Academy</span>
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">Nieuw</span>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Management<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Methodieken
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Ontdek de kracht van bewezen management frameworks. 
            Van Agile tot PRINCE2, van Lean tot SAFe — beheers elke methodiek.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mb-12">
            {[
              { value: '12+', label: 'Methodieken' },
              { value: '94%', label: 'Success Rate' },
              { value: '50K+', label: 'Projecten' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#methodieken" 
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
            >
              <LightningIcon className="w-5 h-5" />
              <span>Verken Methodieken</span>
            </a>
            <a 
              href="#programma" 
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
              </svg>
              Programma Management
            </a>
          </div>
        </div>
      </section>

      {/* Methodieken Section */}
      <section id="methodieken" className="py-24 relative">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-sm mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
              Project Methodieken
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kies Jouw{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Methodiek
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Elke methodiek heeft unieke sterke punten. Ontdek welke het beste past bij jouw project en team.
            </p>
          </div>

          {/* Methodology Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Scrum */}
            <MethodologyCard
              title="Scrum"
              description="Iteratieve sprints met duidelijke rollen, events en artifacts voor maximale productiviteit."
              icon={
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              }
              badge="Agile"
              badgeColor="bg-blue-100 text-blue-600"
              bgColor="bg-blue-100"
              visual={
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    {['Backlog', 'Sprint', 'Review'].map((step, index) => (
                      <React.Fragment key={step}>
                        {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-300" />}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 ${
                            index === 0 ? 'bg-blue-200' : index === 1 ? 'bg-purple-200' : 'bg-green-200'
                          } rounded-full flex items-center justify-center mb-1`}>
                            <svg className={`w-5 h-5 ${
                              index === 0 ? 'text-blue-600' : index === 1 ? 'text-purple-600' : 'text-green-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>}
                              {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>}
                              {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                            </svg>
                          </div>
                          <span className="text-gray-600">{step}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              }
              points={[
                { icon: <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, text: 'Product Owner, Scrum Master, Team' },
                { icon: <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, text: 'Sprints van 2-4 weken' },
                { icon: <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>, text: 'Ideaal voor teams van 3-9' }
              ]}
            />

            {/* Kanban */}
            <MethodologyCard
              title="Kanban"
              description="Visualiseer workflow, limiteer WIP en optimaliseer de continue doorstroom van werk."
              icon={
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                </svg>
              }
              badge="Lean"
              badgeColor="bg-green-100 text-green-600"
              bgColor="bg-green-100"
              visual={
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { title: 'To Do', items: ['gray-300', 'gray-300'], wip: null },
                      { title: 'Doing', items: ['yellow-400'], wip: '1' },
                      { title: 'Review', items: ['blue-400'], wip: null },
                      { title: 'Done', items: ['green-400', 'green-400', 'green-400'], wip: null }
                    ].map((col, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-500 mb-2">{col.title}</div>
                        <div className="space-y-1">
                          {col.items.map((color, i) => (
                            <div key={i} className={`h-3 bg-${color} rounded`}></div>
                          ))}
                        </div>
                        {col.wip && (
                          <div className="text-[10px] text-orange-500 mt-1">WIP: {col.wip}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              }
              points={[
                { icon: <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>, text: 'Visueel workflowbeheer' },
                { icon: <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, text: 'WIP limits voor focus' },
                { icon: <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>, text: 'Continue delivery' }
              ]}
            />

            {/* Waterfall */}
            <MethodologyCard
              title="Waterfall"
              description="Sequentiële fases met duidelijke gates. Ideaal voor projecten met vaste requirements."
              icon={
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              }
              badge="Traditional"
              badgeColor="bg-cyan-100 text-cyan-600"
              bgColor="bg-cyan-100"
              visual={
                <div className="bg-cyan-50 rounded-xl p-4 mb-6 space-y-2">
                  {[
                    { num: '1', label: 'Requirements', pl: 'pl-0', bg: 'bg-cyan-300 text-cyan-800' },
                    { num: '2', label: 'Design', pl: 'pl-3', bg: 'bg-cyan-400 text-white' },
                    { num: '3', label: 'Development', pl: 'pl-6', bg: 'bg-cyan-500 text-white' },
                    { num: '4', label: 'Testing', pl: 'pl-9', bg: 'bg-cyan-600 text-white' }
                  ].map((phase, index) => (
                    <div key={index} className={`flex items-center gap-2 ${phase.pl}`}>
                      <div className={`w-full ${phase.bg} rounded px-3 py-1.5 text-xs flex items-center gap-2`}>
                        <span className="w-5 h-5 bg-cyan-700/30 rounded flex items-center justify-center text-[10px] font-bold">
                          {phase.num}
                        </span>
                        {phase.label}
                      </div>
                    </div>
                  ))}
                </div>
              }
              points={[
                { icon: <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, text: 'Uitgebreide documentatie' },
                { icon: <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>, text: 'Duidelijke milestones' },
                { icon: <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, text: 'Voorspelbaar budget' }
              ]}
            />

            {/* PRINCE2 */}
            <MethodologyCard
              title="PRINCE2"
              description="Process-based methode met sterke governance en controle mechanismen."
              icon={
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              }
              badge="Governance"
              badgeColor="bg-pink-100 text-pink-600"
              bgColor="bg-pink-100"
              visual={
                <div className="bg-pink-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { num: '7', label: 'Principes', bg: 'bg-pink-200' },
                      { num: '7', label: 'Thema\'s', bg: 'bg-pink-300' },
                      { num: '7', label: 'Processen', bg: 'bg-pink-400 text-white' }
                    ].map((item, index) => (
                      <div key={index} className={`${item.bg} rounded-lg p-2`}>
                        <div className="font-bold text-pink-700">{item.num}</div>
                        <div className={item.bg.includes('400') ? 'text-white' : 'text-pink-600'}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              }
              points={[
                { icon: <svg className="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>, text: 'Business case gedreven' },
                { icon: <svg className="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>, text: 'Gedefinieerde rollen' },
                { icon: <svg className="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>, text: 'Sterke governance' }
              ]}
            />

            {/* Lean */}
            <MethodologyCard
              title="Lean"
              description="Elimineer verspilling, maximaliseer waarde en creëer continue verbetering (Kaizen)."
              icon={
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              }
              badge="Toyota"
              badgeColor="bg-orange-100 text-orange-600"
              bgColor="bg-orange-100"
              visual={
                <div className="bg-orange-50 rounded-xl p-4 mb-6">
                  <div className="text-xs text-gray-600 mb-2">5 Lean Principes</div>
                  <div className="flex flex-wrap gap-1">
                    {['Value', 'Stream', 'Flow', 'Pull', 'Perfect'].map((principle, index) => (
                      <span 
                        key={principle}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          index < 2 ? 'bg-orange-200 text-orange-700' :
                          index < 4 ? 'bg-orange-400 text-white' :
                          'bg-orange-600 text-white'
                        }`}
                      >
                        {principle}
                      </span>
                    ))}
                  </div>
                </div>
              }
              points={[
                { icon: <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>, text: 'Elimineer verspilling' },
                { icon: <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>, text: 'Kaizen - Continue verbetering' },
                { icon: <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, text: 'Respect voor mensen' }
              ]}
            />

            {/* Six Sigma */}
            <MethodologyCard
              title="Six Sigma"
              description="Data-gedreven aanpak om defecten te elimineren en variatie te minimaliseren."
              icon={<span className="text-yellow-600 font-bold text-2xl">6σ</span>}
              badge="Quality"
              badgeColor="bg-yellow-100 text-yellow-600"
              bgColor="bg-yellow-100"
              visual={
                <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                  <div className="text-xs text-gray-600 mb-2">DMAIC Cyclus</div>
                  <div className="flex justify-between">
                    {['D', 'M', 'A', 'I', 'C'].map((letter, index) => (
                      <div 
                        key={letter}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 2 ? 'bg-yellow-200 text-yellow-700' :
                          index < 4 ? 'bg-yellow-400 text-yellow-800' :
                          'bg-yellow-600 text-white'
                        }`}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                </div>
              }
              points={[
                { icon: <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, text: 'Data-driven beslissingen' },
                { icon: <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, text: '3.4 defecten per miljoen' },
                { icon: <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>, text: 'Belt certificeringen' }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Program Management Section */}
      <section id="programma" className="py-24 relative bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full text-purple-700 text-sm mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              Program Management
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Programma{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Management
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Coördineer meerdere gerelateerde projecten om strategische doelen te bereiken.
            </p>
          </div>

          {/* Program vs Project Comparison */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Program Management */}
            <div className="bg-white rounded-3xl border border-purple-200 shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Programma Management</h3>
                  <p className="text-gray-500 text-sm">Strategisch, langetermijn</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Strategische Benefits', desc: 'Realiseer strategische organisatiedoelen' },
                  { title: 'Meerdere Projecten', desc: 'Coördineer en integreer gerelateerde projecten' },
                  { title: 'Resource Optimalisatie', desc: 'Efficiënt verdelen van resources over projecten' },
                  { title: 'Change Management', desc: 'Organisatiebrede transformatie begeleiden' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckIcon className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Project Management */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Project Management</h3>
                  <p className="text-gray-500 text-sm">Tactisch, tijdgebonden</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Specifieke Deliverables', desc: 'Lever concrete producten of diensten op' },
                  { title: 'Tijdgebonden', desc: 'Duidelijk begin en eind met deadlines' },
                  { title: 'Scope & Budget', desc: 'Vastgestelde grenzen en middelen' },
                  { title: 'Team Focus', desc: 'Dedicated team voor specifiek doel' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckIcon className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Framework Cards */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Programma Management Frameworks</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <FrameworkCard
                title="MSP®"
                subtitle="Managing Successful Programmes - AXELOS framework voor complexe transformaties."
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                  </svg>
                }
                bgColor="bg-blue-100"
                tags={[
                  { label: 'Governance', color: 'bg-blue-100 text-blue-600' },
                  { label: 'Benefits', color: 'bg-blue-100 text-blue-600' },
                  { label: 'Transformatie', color: 'bg-blue-100 text-blue-600' }
                ]}
              />
              
              <FrameworkCard
                title="PgMP® (PMI)"
                subtitle="Program Management Professional - PMI's standaard voor program managers."
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                }
                bgColor="bg-green-100"
                tags={[
                  { label: 'Certificering', color: 'bg-green-100 text-green-600' },
                  { label: 'Wereldwijd', color: 'bg-green-100 text-green-600' },
                  { label: 'PMBOK', color: 'bg-green-100 text-green-600' }
                ]}
              />
              
              <FrameworkCard
                title="SAFe® Portfolio"
                subtitle="Portfolio level van Scaled Agile Framework voor enterprise-brede alignment."
                icon={
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                }
                bgColor="bg-purple-100"
                tags={[
                  { label: 'Agile', color: 'bg-purple-100 text-purple-600' },
                  { label: 'Enterprise', color: 'bg-purple-100 text-purple-600' },
                  { label: 'Lean', color: 'bg-purple-100 text-purple-600' }
                ]}
              />
            </div>
          </div>

          {/* Program Hierarchy */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Programma Hiërarchie</h3>
            
            <div className="max-w-4xl mx-auto">
              {/* Portfolio */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xl font-bold text-white">Portfolio</div>
                    <div className="text-sm text-purple-100">Strategische alignment</div>
                  </div>
                </div>
              </div>
              
              {/* Connector */}
              <div className="flex justify-center mb-8">
                <div className="w-0.5 h-12 bg-gradient-to-b from-purple-400 to-blue-400"></div>
              </div>
              
              {/* Programs */}
              <div className="flex justify-center gap-8 mb-8 flex-wrap">
                <div className="px-6 py-4 bg-purple-100 border border-purple-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                    </svg>
                    <div>
                      <div className="font-bold text-purple-700">Programma A</div>
                      <div className="text-xs text-purple-500">Digital Transformatie</div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-pink-100 border border-pink-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                    </svg>
                    <div>
                      <div className="font-bold text-pink-700">Programma B</div>
                      <div className="text-xs text-pink-500">Customer Experience</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connectors */}
              <div className="flex justify-center gap-32 mb-8">
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-300 to-blue-300"></div>
                <div className="w-0.5 h-8 bg-gradient-to-b from-pink-300 to-orange-300"></div>
              </div>
              
              {/* Projects */}
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: 'Project 1', desc: 'CRM Implementatie', color: 'blue' },
                  { name: 'Project 2', desc: 'Data Analytics', color: 'green' },
                  { name: 'Project 3', desc: 'App Development', color: 'cyan' },
                  { name: 'Project 4', desc: 'UX Redesign', color: 'orange' }
                ].map((project, index) => (
                  <div key={index} className={`px-4 py-3 bg-${project.color}-50 border border-${project.color}-200 rounded-xl`}>
                    <div className={`text-sm font-medium text-${project.color}-700`}>{project.name}</div>
                    <div className={`text-xs text-${project.color}-500`}>{project.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combinations Section */}
      <section id="combinaties" className="py-24 relative">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 border border-pink-200 rounded-full text-pink-700 text-sm mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              Hybrid Approaches
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Methodiek{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Combinaties
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              De kracht van gecombineerde methodieken. Kies de beste elementen voor jouw specifieke situatie.
            </p>
          </div>

          {/* Combination Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <CombinationCard
              title="Scrumban"
              subtitle="Scrum + Kanban"
              icons={[
                { letter: 'S', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                { letter: 'K', bgColor: 'bg-green-100', textColor: 'text-green-600' }
              ]}
              description="Combineer Scrum's structuur met Kanban's flexibiliteit. Ideaal voor teams die migreren van Scrum naar een meer flow-based aanpak."
              leftTitle="Van Scrum:"
              leftColor="text-blue-600"
              leftPoints={['Daily standups', 'Retrospectives', 'Backlog refinement']}
              rightTitle="Van Kanban:"
              rightColor="text-green-600"
              rightPoints={['WIP limits', 'Pull-based flow', 'Visual board']}
              tags={[
                { label: 'Support Teams', color: 'bg-blue-100 text-blue-600' },
                { label: 'Maintenance', color: 'bg-green-100 text-green-600' },
                { label: 'DevOps', color: 'bg-purple-100 text-purple-600' }
              ]}
            />

            <CombinationCard
              title="Water-Scrum-Fall"
              subtitle="Waterfall + Scrum + Waterfall"
              icons={[
                { letter: 'W', bgColor: 'bg-cyan-100', textColor: 'text-cyan-600' },
                { letter: 'S', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                { letter: 'W', bgColor: 'bg-cyan-100', textColor: 'text-cyan-600' }
              ]}
              description="Begin met waterfall planning, voer uit in agile sprints, en sluit af met waterfall testing en deployment."
              leftTitle="Waterfall fasen:"
              leftColor="text-cyan-600"
              leftPoints={['Planning', 'Requirements', 'Deployment']}
              rightTitle="Scrum fasen:"
              rightColor="text-blue-600"
              rightPoints={['Sprints', 'Iteraties', 'Daily standups']}
              tags={[
                { label: 'Enterprise', color: 'bg-cyan-100 text-cyan-600' },
                { label: 'Compliance', color: 'bg-pink-100 text-pink-600' },
                { label: 'Fixed Budget', color: 'bg-orange-100 text-orange-600' }
              ]}
            />

            <CombinationCard
              title="Lean Six Sigma"
              subtitle="Lean + Six Sigma"
              icons={[
                { letter: 'L', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
                { letter: '6σ', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' }
              ]}
              description="Combineer Lean's waste elimination met Six Sigma's data-gedreven kwaliteitsverbetering voor maximale efficiency."
              leftTitle="Van Lean:"
              leftColor="text-orange-600"
              leftPoints={['Value stream mapping', 'Waste elimination', 'Kaizen events']}
              rightTitle="Van Six Sigma:"
              rightColor="text-yellow-600"
              rightPoints={['DMAIC methodology', 'Statistical analysis', 'Root cause analysis']}
              tags={[
                { label: 'Manufacturing', color: 'bg-orange-100 text-orange-600' },
                { label: 'Operations', color: 'bg-yellow-100 text-yellow-600' },
                { label: 'Healthcare', color: 'bg-green-100 text-green-600' }
              ]}
            />

            <CombinationCard
              title="PRINCE2 Agile®"
              subtitle="PRINCE2 + Agile"
              icons={[
                { letter: 'P2', bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
                { letter: 'A', bgColor: 'bg-green-100', textColor: 'text-green-600' }
              ]}
              description="Officiële AXELOS methodiek die PRINCE2's governance combineert met Agile's flexibiliteit en snelheid."
              leftTitle="Van PRINCE2:"
              leftColor="text-pink-600"
              leftPoints={['Business case focus', 'Stage gates', 'Exception management']}
              rightTitle="Van Agile:"
              rightColor="text-green-600"
              rightPoints={['Iterative delivery', 'Self-organizing teams', 'Customer collaboration']}
              tags={[
                { label: 'Government', color: 'bg-pink-100 text-pink-600' },
                { label: 'Certified', color: 'bg-green-100 text-green-600' },
                { label: 'UK/EU', color: 'bg-blue-100 text-blue-600' }
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white text-sm mb-6">
              <LightningIcon className="w-4 h-4" />
              Start Vandaag
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Klaar om jouw<br />
              methodiek te kiezen?
            </h2>
            
            <p className="text-xl text-purple-100 mb-10">
              ProjeXtPal ondersteunt alle methodieken. Configureer jouw werkwijze en start direct met projecten die écht werken.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/register" 
                className="group px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:shadow-xl transition-all flex items-center gap-2"
              >
                <LightningIcon className="w-5 h-5" />
                <span>Gratis Starten</span>
              </Link>
              <Link 
                to="/demo" 
                className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>Plan een Demo</span>
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-12 border-t border-white/20">
              {[
                { icon: 'shield', label: 'GDPR Compliant' },
                { icon: 'cloud', label: 'EU Data Centers' },
                { icon: 'lightning', label: 'AI-Powered' },
                { icon: 'currency', label: '14-dagen gratis' }
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {badge.icon === 'shield' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>}
                    {badge.icon === 'cloud' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>}
                    {badge.icon === 'lightning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>}
                    {badge.icon === 'currency' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>}
                  </svg>
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">PX</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                Proje<span className="text-purple-600">X</span>tPal
              </span>
            </Link>
            
            <div className="text-gray-500 text-sm">
              © 2024 ProjeXtPal. All rights reserved. | Academy - Management Methodieken
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManagementMethodiekenPage;