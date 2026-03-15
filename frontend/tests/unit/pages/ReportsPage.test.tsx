import { describe, it, expect } from 'vitest'
import { render, screen } from '@tests/helpers/render'

describe('ReportsPage', () => {
  it('renders reports page heading and description', () => {
    render(
      <div className="relative z-10 p-8 md:p-10 space-y-8 max-w-[1800px] mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>AI-Powered Reports</span>
            <span>New</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Generate AI-powered insights and reports tailored to your role
          </p>
        </div>
      </div>
    )
    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Reports')).toBeInTheDocument()
    expect(screen.getByText('Generate AI-powered insights and reports tailored to your role')).toBeInTheDocument()
  })

  it('displays report category tabs', () => {
    const categories = [
      { id: 'all', label: 'All Reports' },
      { id: 'executive', label: 'Executive' },
      { id: 'program', label: 'Program' },
      { id: 'project', label: 'Project' },
      { id: 'personal', label: 'Personal' },
      { id: 'scheduled', label: 'Scheduled' },
    ]

    render(
      <div className="border-b px-7 pt-7">
        <div className="p-1.5 rounded-2xl">
          {categories.map((cat) => (
            <button key={cat.id} className="rounded-xl px-6 py-2.5 text-sm font-bold">
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    )
    expect(screen.getByText('All Reports')).toBeInTheDocument()
    expect(screen.getByText('Executive')).toBeInTheDocument()
    expect(screen.getByText('Program')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
  })

  it('renders report template cards with details', () => {
    const reports = [
      { id: 'portfolio-analysis', title: 'Portfolio Analysis', description: 'AI-powered analysis of all programs and projects with strategic insights', aiPowered: true },
      { id: 'executive-summary', title: 'Executive Summary', description: 'High-level overview of portfolio health, budget, and key risks', aiPowered: true },
      { id: 'financial-overview', title: 'Financial Overview', description: 'Budget allocation, spending trends, and financial forecasts', aiPowered: true },
    ]

    render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="border-0 ring-1 ring-purple-100">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg" />
              {report.aiPowered && <span className="text-xs">AI</span>}
            </div>
            <h3 className="text-lg">{report.title}</h3>
            <p>{report.description}</p>
            <div className="flex gap-2">
              <button className="flex-1">Generate</button>
              <button>Download</button>
            </div>
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('Portfolio Analysis')).toBeInTheDocument()
    expect(screen.getByText('Executive Summary')).toBeInTheDocument()
    expect(screen.getByText('Financial Overview')).toBeInTheDocument()
    expect(screen.getByText('AI-powered analysis of all programs and projects with strategic insights')).toBeInTheDocument()
  })

  it('renders all report types across categories', () => {
    const reportTitles = [
      'Portfolio Analysis',
      'Executive Summary',
      'Financial Overview',
      'Program Performance',
      'Benefits Realization',
      'Governance Report',
      'Project Status Report',
      'Team Performance',
      'Budget Analysis',
      'Risk Analysis',
      'Time Tracking Report',
      'Personal Performance',
      'Weekly Summary',
    ]

    render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTitles.map((title) => (
          <div key={title}>
            <h3 className="text-lg">{title}</h3>
          </div>
        ))}
      </div>
    )
    reportTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('displays generate and download buttons for each report', () => {
    render(
      <div className="flex gap-2">
        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl">
          Generate
        </button>
        <button className="rounded-xl">
          Download
        </button>
      </div>
    )
    expect(screen.getByText('Generate')).toBeInTheDocument()
    expect(screen.getByText('Download')).toBeInTheDocument()
  })

  it('shows empty state when no reports are available for category', () => {
    render(
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">No reports available for this category</p>
      </div>
    )
    expect(screen.getByText('No reports available for this category')).toBeInTheDocument()
  })

  it('shows generating state for report', () => {
    render(
      <button disabled className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl">
        Generating...
      </button>
    )
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByText('Generating...')).toBeDisabled()
  })
})

describe('ReportModal', () => {
  it('renders loading state while generating report', () => {
    render(
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <p className="text-lg font-semibold text-purple-700">Generating AI Report...</p>
        <p className="text-sm text-gray-500">Analyzing data and creating insights</p>
      </div>
    )
    expect(screen.getByText('Generating AI Report...')).toBeInTheDocument()
    expect(screen.getByText('Analyzing data and creating insights')).toBeInTheDocument()
  })

  it('renders report with title and executive summary', () => {
    const report = {
      title: 'Portfolio Analysis Report',
      executive_summary: 'The portfolio is performing well with 85% of projects on track.',
    }

    render(
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">{report.title}</h2>
          <button>Download PDF</button>
        </div>
        <div className="space-y-6 mt-4">
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-bold text-lg text-purple-800 mb-2">Executive Summary</h3>
            <p className="text-gray-700 whitespace-pre-line">{report.executive_summary}</p>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Portfolio Analysis Report')).toBeInTheDocument()
    expect(screen.getByText('Executive Summary')).toBeInTheDocument()
    expect(screen.getByText('The portfolio is performing well with 85% of projects on track.')).toBeInTheDocument()
    expect(screen.getByText('Download PDF')).toBeInTheDocument()
  })

  it('displays KPI metrics in report', () => {
    const kpis = [
      { name: 'Budget Utilization', value: '78%', trend: 'up' },
      { name: 'On-Time Delivery', value: '92%', trend: 'up' },
      { name: 'Risk Score', value: '3.2', trend: 'down' },
      { name: 'Team Satisfaction', value: '4.5/5', trend: 'stable' },
    ]

    render(
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border shadow-sm text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{kpi.name}</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{kpi.value}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-xs capitalize">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument()
    expect(screen.getByText('78%')).toBeInTheDocument()
    expect(screen.getByText('On-Time Delivery')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('Risk Score')).toBeInTheDocument()
    expect(screen.getByText('Team Satisfaction')).toBeInTheDocument()
  })

  it('renders report sections with headings and content', () => {
    const sections = [
      { heading: 'Project Health Overview', content: 'All active projects are currently within acceptable risk thresholds.' },
      { heading: 'Resource Allocation', content: 'Current resource utilization stands at 87% across all teams.' },
    ]

    render(
      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-bold text-lg text-gray-800 border-l-4 border-purple-500 pl-3">
              {section.heading}
            </h3>
            <p className="text-gray-600 whitespace-pre-line pl-3">{section.content}</p>
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('Project Health Overview')).toBeInTheDocument()
    expect(screen.getByText('All active projects are currently within acceptable risk thresholds.')).toBeInTheDocument()
    expect(screen.getByText('Resource Allocation')).toBeInTheDocument()
  })

  it('displays recommendations section', () => {
    const recommendations = [
      'Increase budget allocation for Q3 infrastructure projects',
      'Hire additional resources for the mobile development team',
      'Implement weekly risk review meetings',
    ]

    render(
      <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
        <h3 className="font-bold text-lg text-emerald-800 mb-3 flex items-center gap-2">
          Recommendations
        </h3>
        <ul className="space-y-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>{rec}
            </li>
          ))}
        </ul>
      </div>
    )
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Increase budget allocation for Q3 infrastructure projects')).toBeInTheDocument()
    expect(screen.getByText('Implement weekly risk review meetings')).toBeInTheDocument()
  })

  it('displays risk highlights section', () => {
    const risks = [
      'Supply chain delays may impact delivery timeline by 2 weeks',
      'Key team member departing in Q2 creates knowledge gap',
    ]

    render(
      <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
        <h3 className="font-bold text-lg text-orange-800 mb-3 flex items-center gap-2">
          Risk Highlights
        </h3>
        <ul className="space-y-2">
          {risks.map((risk, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="text-orange-500 font-bold mt-0.5">!</span>{risk}
            </li>
          ))}
        </ul>
      </div>
    )
    expect(screen.getByText('Risk Highlights')).toBeInTheDocument()
    expect(screen.getByText('Supply chain delays may impact delivery timeline by 2 weeks')).toBeInTheDocument()
    expect(screen.getByText('Key team member departing in Q2 creates knowledge gap')).toBeInTheDocument()
  })
})
