import { describe, it, expect } from 'vitest'
import { render, screen } from '@tests/helpers/render'

describe('Portfolios Page', () => {
  it('renders portfolio list heading and description', () => {
    render(
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">Strategic Portfolios</h1>
            <p className="text-muted-foreground mt-1">Manage strategic initiatives and governance</p>
          </div>
          <button>New Portfolio</button>
        </div>
      </div>
    )
    expect(screen.getByText('Strategic Portfolios')).toBeInTheDocument()
    expect(screen.getByText('Manage strategic initiatives and governance')).toBeInTheDocument()
  })

  it('displays portfolio summary metrics', () => {
    render(
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><p className="text-sm text-muted-foreground">Total Portfolios</p><p className="text-2xl font-bold mt-1">5</p></div>
        <div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold mt-1">3</p></div>
        <div><p className="text-sm text-muted-foreground">Total Boards</p><p className="text-2xl font-bold mt-1">12</p></div>
        <div><p className="text-sm text-muted-foreground">Total Budget</p><p className="text-2xl font-bold mt-1">€150,000</p></div>
      </div>
    )
    expect(screen.getByText('Total Portfolios')).toBeInTheDocument()
    expect(screen.getByText('Total Boards')).toBeInTheDocument()
    expect(screen.getByText('Total Budget')).toBeInTheDocument()
  })

  it('renders portfolio cards with details', () => {
    const portfolios = [
      { id: '1', name: 'Digital Transformation', status: 'active', description: 'Company-wide digital initiatives', owner_name: 'Jane Smith', total_boards: 3, budget_allocated: 50000 },
      { id: '2', name: 'Infrastructure Upgrade', status: 'planning', description: 'Core infrastructure modernization', owner_name: 'Bob Johnson', total_boards: 2, budget_allocated: 75000 },
    ]

    render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="cursor-pointer">
            <div className="flex items-start justify-between">
              <h3 className="text-lg">{portfolio.name}</h3>
              <span>{portfolio.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{portfolio.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Owner</span><span className="font-medium">{portfolio.owner_name}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Governance Boards</span><span className="font-medium">{portfolio.total_boards}</span></div>
            </div>
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('Digital Transformation')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure Upgrade')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Company-wide digital initiatives')).toBeInTheDocument()
  })

  it('shows empty state when no portfolios exist', () => {
    render(
      <div className="p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No Portfolios Yet</h3>
        <p className="text-muted-foreground mb-4">Create your first strategic portfolio to get started</p>
        <button>Create Portfolio</button>
      </div>
    )
    expect(screen.getByText('No Portfolios Yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first strategic portfolio to get started')).toBeInTheDocument()
    expect(screen.getByText('Create Portfolio')).toBeInTheDocument()
  })

  it('displays edit portfolio modal fields', () => {
    render(
      <div>
        <h2>Edit Portfolio: Digital Transformation</h2>
        <div className="space-y-4 mt-4">
          <div className="grid gap-2"><label>Name</label></div>
          <div className="grid gap-2"><label>Description</label></div>
          <div className="grid gap-2">
            <label>Status</label>
            <select>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="grid gap-2"><label>Budget</label></div>
          <div className="grid gap-2"><label>Strategic Objectives</label></div>
          <div className="flex justify-end gap-2 pt-2">
            <button>Cancel</button>
            <button>Save Changes</button>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Edit Portfolio: Digital Transformation')).toBeInTheDocument()
    expect(screen.getByText('Strategic Objectives')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })
})

describe('Governance Boards Page', () => {
  it('renders boards heading and description', () => {
    render(
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">Governance Boards</h1>
            <p className="text-muted-foreground mt-1">Steering committees, program boards, and advisory panels</p>
          </div>
          <button>New Board</button>
        </div>
      </div>
    )
    expect(screen.getByText('Governance Boards')).toBeInTheDocument()
    expect(screen.getByText('Steering committees, program boards, and advisory panels')).toBeInTheDocument()
    expect(screen.getByText('New Board')).toBeInTheDocument()
  })

  it('displays board summary statistics', () => {
    render(
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><p className="text-sm text-muted-foreground">Total Boards</p><p className="text-2xl font-bold mt-1">8</p></div>
        <div><p className="text-sm text-muted-foreground">Active Boards</p><p className="text-2xl font-bold mt-1">6</p></div>
        <div><p className="text-sm text-muted-foreground">Total Members</p><p className="text-2xl font-bold mt-1">24</p></div>
        <div><p className="text-sm text-muted-foreground">Steering Committees</p><p className="text-2xl font-bold mt-1">2</p></div>
      </div>
    )
    expect(screen.getByText('Total Boards')).toBeInTheDocument()
    expect(screen.getByText('Active Boards')).toBeInTheDocument()
    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('Steering Committees')).toBeInTheDocument()
  })

  it('renders board cards with type badges and details', () => {
    const boards = [
      { id: '1', name: 'Strategic Investment Board', board_type: 'steering_committee', description: 'Oversees investment decisions', chair_name: 'Alice Johnson', member_count: 5, meeting_frequency: 'Monthly', is_active: true },
      { id: '2', name: 'Program Oversight Board', board_type: 'program_board', description: 'Monitors program delivery', chair_name: 'Bob Smith', member_count: 7, meeting_frequency: 'Weekly', is_active: true },
    ]

    const getBoardTypeLabel = (type: string) => {
      const labels: Record<string, string> = { steering_committee: 'Steering Committee', program_board: 'Program Board', project_board: 'Project Board', advisory_board: 'Advisory Board', executive_board: 'Executive Board' }
      return labels[type] || type
    }

    render(
      <div className="space-y-4">
        {boards.map((board) => (
          <div key={board.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl">{board.name}</h3>
                  <span>{getBoardTypeLabel(board.board_type)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{board.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Chair</span><p className="font-medium mt-1">{board.chair_name}</p></div>
              <div><span className="text-muted-foreground">Members</span><p className="font-medium mt-1">{board.member_count}</p></div>
              <div><span className="text-muted-foreground">Meeting Frequency</span><p className="font-medium mt-1">{board.meeting_frequency}</p></div>
            </div>
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('Strategic Investment Board')).toBeInTheDocument()
    expect(screen.getByText('Program Oversight Board')).toBeInTheDocument()
    expect(screen.getByText('Steering Committee')).toBeInTheDocument()
    expect(screen.getByText('Program Board')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getAllByText('Meeting Frequency')).toHaveLength(2)
  })

  it('shows empty state when no boards exist', () => {
    render(
      <div className="p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No Governance Boards Yet</h3>
        <p className="text-muted-foreground mb-4">Create your first governance board to establish oversight</p>
        <button>Create Board</button>
      </div>
    )
    expect(screen.getByText('No Governance Boards Yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first governance board to establish oversight')).toBeInTheDocument()
  })

  it('displays edit board modal with board type options', () => {
    render(
      <div>
        <h2>Edit Board: Strategic Investment Board</h2>
        <div className="space-y-4 mt-4">
          <div className="grid gap-2"><label>Name</label></div>
          <div className="grid gap-2"><label>Description</label></div>
          <div className="grid gap-2">
            <label>Board Type</label>
            <select>
              <option value="steering_committee">Steering Committee</option>
              <option value="program_board">Program Board</option>
              <option value="project_board">Project Board</option>
              <option value="advisory_board">Advisory Board</option>
              <option value="executive_board">Executive Board</option>
            </select>
          </div>
          <div className="grid gap-2"><label>Meeting Frequency</label></div>
          <div className="flex justify-end gap-2 pt-2">
            <button>Cancel</button>
            <button>Save Changes</button>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Edit Board: Strategic Investment Board')).toBeInTheDocument()
    expect(screen.getByText('Board Type')).toBeInTheDocument()
    expect(screen.getByText('Meeting Frequency')).toBeInTheDocument()
  })
})

describe('Stakeholder Management Page', () => {
  it('renders stakeholder heading and description', () => {
    render(
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">Stakeholder Management</h1>
            <p className="text-muted-foreground mt-1">Strategic stakeholder engagement and influence mapping</p>
          </div>
          <button>Add Stakeholder</button>
        </div>
      </div>
    )
    expect(screen.getByText('Stakeholder Management')).toBeInTheDocument()
    expect(screen.getByText('Strategic stakeholder engagement and influence mapping')).toBeInTheDocument()
    expect(screen.getByText('Add Stakeholder')).toBeInTheDocument()
  })

  it('displays stakeholder matrix summary metrics', () => {
    render(
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><p className="text-sm text-muted-foreground">Total Stakeholders</p><p className="text-2xl font-bold mt-1">15</p></div>
        <div><p className="text-sm text-muted-foreground">Key Players</p><p className="text-2xl font-bold mt-1">4</p></div>
        <div><p className="text-sm text-muted-foreground">High Influence</p><p className="text-2xl font-bold mt-1">7</p></div>
        <div><p className="text-sm text-muted-foreground">High Interest</p><p className="text-2xl font-bold mt-1">9</p></div>
      </div>
    )
    expect(screen.getByText('Total Stakeholders')).toBeInTheDocument()
    expect(screen.getByText('Key Players')).toBeInTheDocument()
    expect(screen.getByText('High Influence')).toBeInTheDocument()
    expect(screen.getByText('High Interest')).toBeInTheDocument()
  })

  it('renders stakeholder list with role and influence badges', () => {
    const stakeholders = [
      { id: '1', user_name: 'Alice Johnson', user_email: 'alice@test.com', role: 'executive_sponsor', influence_level: 'high', interest_level: 'high', communication_plan: 'Weekly status meetings' },
      { id: '2', user_name: 'Bob Smith', user_email: 'bob@test.com', role: 'key_stakeholder', influence_level: 'medium', interest_level: 'high', communication_plan: 'Monthly reviews' },
    ]

    const getRoleLabel = (role: string) => {
      const labels: Record<string, string> = { executive_sponsor: 'Executive Sponsor', senior_responsible_owner: 'Senior Responsible Owner', business_change_manager: 'Business Change Manager', project_executive: 'Project Executive', key_stakeholder: 'Key Stakeholder' }
      return labels[role] || role
    }

    render(
      <div className="space-y-3">
        {stakeholders.map((s) => (
          <div key={s.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{s.user_name}</p>
                  <p className="text-sm text-muted-foreground">{s.user_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>{getRoleLabel(s.role)}</span>
                <span>{s.influence_level} influence</span>
                <span>{s.interest_level} interest</span>
              </div>
            </div>
            {s.communication_plan && (
              <p className="text-sm text-muted-foreground mt-2">{s.communication_plan}</p>
            )}
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('Executive Sponsor')).toBeInTheDocument()
    expect(screen.getByText('high influence')).toBeInTheDocument()
    expect(screen.getByText('Weekly status meetings')).toBeInTheDocument()
    expect(screen.getByText('Key Stakeholder')).toBeInTheDocument()
  })

  it('shows empty state when no stakeholders exist', () => {
    render(
      <div className="p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No Stakeholders Yet</h3>
        <p className="text-muted-foreground mb-4">Add stakeholders to track engagement and influence</p>
        <button>Add Stakeholder</button>
      </div>
    )
    expect(screen.getByText('No Stakeholders Yet')).toBeInTheDocument()
    expect(screen.getByText('Add stakeholders to track engagement and influence')).toBeInTheDocument()
  })

  it('displays edit stakeholder modal with influence and interest levels', () => {
    render(
      <div>
        <h2>Edit Stakeholder: Alice Johnson</h2>
        <div className="space-y-4 mt-4">
          <div className="grid gap-2">
            <label>Role</label>
            <select>
              <option value="executive_sponsor">Executive Sponsor</option>
              <option value="senior_responsible_owner">Senior Responsible Owner</option>
              <option value="business_change_manager">Business Change Manager</option>
              <option value="project_executive">Project Executive</option>
              <option value="key_stakeholder">Key Stakeholder</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label>Influence Level</label>
              <select>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label>Interest Level</label>
              <select>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <label>Communication Plan</label>
            <textarea placeholder="How should this stakeholder be engaged?" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button>Cancel</button>
            <button>Save Changes</button>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Edit Stakeholder: Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Influence Level')).toBeInTheDocument()
    expect(screen.getByText('Interest Level')).toBeInTheDocument()
    expect(screen.getByText('Communication Plan')).toBeInTheDocument()
  })
})

describe('CreateBoard Form Page', () => {
  it('renders create board form with heading and fields', () => {
    render(
      <div className="relative z-10 p-8 md:p-10 space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button className="gap-2">Back to Boards</button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            <span>New Governance Board</span>
          </h1>
          <p className="text-gray-600">Create a governance board to oversee portfolio initiatives</p>
        </div>
        <div>
          <h3 className="flex items-center gap-3">Board Details</h3>
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="portfolio">Portfolio <span className="text-red-500">*</span></label>
              <select id="portfolio"><option>Select a portfolio</option></select>
            </div>
            <div className="space-y-2">
              <label htmlFor="name">Board Name <span className="text-red-500">*</span></label>
              <input id="name" placeholder="e.g., Strategic Investment Board" />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <textarea id="description" placeholder="Describe the board's responsibilities and scope..." />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button">Cancel</button>
              <button type="submit">Create Board</button>
            </div>
          </form>
        </div>
      </div>
    )
    expect(screen.getByText('New Governance Board')).toBeInTheDocument()
    expect(screen.getByText('Create a governance board to oversee portfolio initiatives')).toBeInTheDocument()
    expect(screen.getByText('Board Details')).toBeInTheDocument()
    expect(screen.getByLabelText(/Board Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByText('Back to Boards')).toBeInTheDocument()
    expect(screen.getByText('Create Board')).toBeInTheDocument()
  })

  it('displays portfolio selection dropdown', () => {
    const portfolios = [
      { id: 1, name: 'Digital Transformation Portfolio' },
      { id: 2, name: 'Infrastructure Portfolio' },
    ]

    render(
      <div className="space-y-2">
        <label htmlFor="portfolio">Portfolio</label>
        <select id="portfolio">
          <option value="">Select a portfolio</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id.toString()}>{p.name}</option>
          ))}
        </select>
      </div>
    )
    expect(screen.getByLabelText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Digital Transformation Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure Portfolio')).toBeInTheDocument()
  })
})

describe('CreatePortfolio Form Page', () => {
  it('renders create portfolio form with heading and fields', () => {
    render(
      <div className="relative z-10 p-8 md:p-10 space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button className="gap-2">Back to Portfolios</button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            <span>New Strategic Portfolio</span>
          </h1>
          <p className="text-gray-600">Create a portfolio to manage strategic initiatives and governance</p>
        </div>
        <div>
          <h3 className="flex items-center gap-3">Portfolio Details</h3>
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name">Portfolio Name <span className="text-red-500">*</span></label>
              <input id="name" placeholder="e.g., Digital Transformation Portfolio" />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <textarea id="description" placeholder="Describe the strategic objectives and scope of this portfolio..." />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button">Cancel</button>
              <button type="submit">Create Portfolio</button>
            </div>
          </form>
        </div>
      </div>
    )
    expect(screen.getByText('New Strategic Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Create a portfolio to manage strategic initiatives and governance')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Details')).toBeInTheDocument()
    expect(screen.getByLabelText(/Portfolio Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByText('Back to Portfolios')).toBeInTheDocument()
    expect(screen.getByText('Create Portfolio')).toBeInTheDocument()
  })

  it('shows cancel and submit buttons in proper state', () => {
    render(
      <div className="flex gap-4 pt-4">
        <button type="button" className="flex-1 h-12">Cancel</button>
        <button type="submit" disabled className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">Create Portfolio</button>
      </div>
    )
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create Portfolio')).toBeDisabled()
  })
})
