import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Building2, DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      label: t('dashboard.totalUsers'),
      value: '6',
      change: '+50%',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Building2,
      label: t('dashboard.organizations'),
      value: '3',
      change: '+200%',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: DollarSign,
      label: t('dashboard.mrr'),
      value: '€350',
      change: '+35.3%',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: CreditCard,
      label: t('dashboard.subscriptions'),
      value: '3',
      change: '+4.1%',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                ProjeXtPal {t('admin.portal')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('admin.superadmin')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            📊 {t('dashboard.title')}
          </h2>
          <p className="text-gray-400">
            {t('admin.realTimeStats')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {stat.change} {t('dashboard.vsLastMonth')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            ⚡ {t('dashboard.quickActions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('dashboard.newUser'), gradient: 'from-purple-500 to-pink-500', icon: Users },
              { label: t('dashboard.newOrganization'), gradient: 'from-blue-500 to-purple-500', icon: Building2 },
              { label: t('dashboard.generateReport'), gradient: 'from-green-500 to-blue-500', icon: DollarSign },
              { label: t('dashboard.systemConfig'), gradient: 'from-orange-500 to-pink-500', icon: CreditCard },
            ].map((action, index) => (
              <button
                key={index}
                className={`bg-gradient-to-br ${action.gradient} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
              >
                <action.icon className="w-7 h-7 text-white mb-3" />
                <div className="text-sm font-semibold text-white text-left">
                  {action.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Modules */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            🎯 {t('dashboard.adminModules')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: t('modules.users'), subtitle: t('modules.usersSubtitle'), count: '6', gradient: 'from-purple-500 to-pink-500' },
              { title: t('modules.organizations'), subtitle: t('modules.organizationsSubtitle'), count: '3', gradient: 'from-blue-500 to-purple-500' },
              { title: t('modules.integrations'), subtitle: t('modules.integrationsSubtitle'), count: '12', gradient: 'from-green-500 to-blue-500' },
              { title: t('modules.subscriptions'), subtitle: t('modules.subscriptionsSubtitle'), count: '3', gradient: 'from-orange-500 to-pink-500' },
            ].map((module, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center shadow-lg`}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {module.title}
                      </h4>
                      <span className="text-xs font-bold text-gray-400 bg-white/10 px-2 py-1 rounded">
                        {module.count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {module.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
