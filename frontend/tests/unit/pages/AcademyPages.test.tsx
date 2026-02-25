import { describe, it, expect } from 'vitest'
import { render, screen } from '@tests/helpers/render'

describe('CourseDetail Page', () => {
  it('renders course title and subtitle', () => {
    render(
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Project Management Fundamentals
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Master the essential skills for managing projects successfully
          </p>
        </div>
      </div>
    )
    expect(screen.getByText('Project Management Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Master the essential skills for managing projects successfully')).toBeInTheDocument()
  })

  it('displays course rating and student count', () => {
    render(
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-900">4.8</span>
          <span className="text-gray-500">(1,250 reviews)</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <span>15,000 students</span>
        </div>
        <span>Intermediate</span>
        <span>Nederlands</span>
      </div>
    )
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.getByText('(1,250 reviews)')).toBeInTheDocument()
    expect(screen.getByText('15,000 students')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
  })

  it('renders what you will learn section', () => {
    const learningPoints = [
      'Understand project lifecycle phases',
      'Create effective project plans',
      'Manage stakeholders and communication',
      'Apply risk management techniques',
    ]

    render(
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          What you'll learn
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {learningPoints.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
    expect(screen.getByText("What you'll learn")).toBeInTheDocument()
    expect(screen.getByText('Understand project lifecycle phases')).toBeInTheDocument()
    expect(screen.getByText('Apply risk management techniques')).toBeInTheDocument()
  })

  it('displays course content summary with module and lesson counts', () => {
    render(
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
          <span className="text-sm text-gray-500">8 modules • 42 lessons • 12 hours total</span>
        </div>
      </div>
    )
    expect(screen.getByText('Course Content')).toBeInTheDocument()
    expect(screen.getByText('8 modules • 42 lessons • 12 hours total')).toBeInTheDocument()
  })

  it('renders requirements section', () => {
    const requirements = [
      'No prior project management experience needed',
      'Basic computer skills',
      'Willingness to learn and practice',
    ]

    render(
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
        <ul className="space-y-2">
          {requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="text-purple-500">•</span>
              {req}
            </li>
          ))}
        </ul>
      </div>
    )
    expect(screen.getByText('Requirements')).toBeInTheDocument()
    expect(screen.getByText('No prior project management experience needed')).toBeInTheDocument()
  })

  it('renders instructor information', () => {
    render(
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h2>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">ProjeXtPal Team</h3>
            <p className="text-sm text-purple-600 mb-2">Expert Instructors</p>
            <p className="text-sm text-gray-600 mb-3">Learn from industry experts with years of real-world experience.</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>4.8</span>
              <span>10,000</span>
              <span>11 courses</span>
            </div>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Your Instructor')).toBeInTheDocument()
    expect(screen.getByText('ProjeXtPal Team')).toBeInTheDocument()
    expect(screen.getByText('Expert Instructors')).toBeInTheDocument()
  })

  it('shows course not found state for invalid course id', () => {
    render(
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course "invalid-id" does not exist.</p>
          <button>Back to Academy</button>
        </div>
      </div>
    )
    expect(screen.getByText('Course not found')).toBeInTheDocument()
    expect(screen.getByText('Back to Academy')).toBeInTheDocument()
  })

  it('displays course sidebar with pricing and CTA', () => {
    render(
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">Free</span>
          </div>
          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">Included in your subscription</p>
        </div>
        <button className="w-full h-12 text-base font-bold rounded-xl">Start Course</button>
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl">Save</button>
          <button className="flex-1 rounded-xl">Share</button>
        </div>
        <div className="space-y-3 pt-4 border-t">
          <p className="font-semibold text-gray-900">This course includes:</p>
          <div className="space-y-2 text-sm">
            <span>12 hours total</span>
            <span>42 lessons</span>
            <span>Downloadable resources</span>
            <span>Lifetime access</span>
            <span>AI support</span>
            <span>Certificate</span>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Start Course')).toBeInTheDocument()
    expect(screen.getByText('This course includes:')).toBeInTheDocument()
    expect(screen.getByText('Lifetime access')).toBeInTheDocument()
    expect(screen.getByText('Certificate')).toBeInTheDocument()
  })
})

describe('AcademyPricing Page', () => {
  it('renders pricing hero section', () => {
    render(
      <div className="pt-32 pb-16 relative overflow-hidden">
        <div className="relative container mx-auto px-4 text-center">
          <span>Transparent Pricing</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Invest in your <span>Professional Growth</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Choose the plan that fits your learning goals. From free introduction to full certification programs.
          </p>
        </div>
      </div>
    )
    expect(screen.getByText('Transparent Pricing')).toBeInTheDocument()
    expect(screen.getByText(/Professional Growth/)).toBeInTheDocument()
    expect(screen.getByText(/Choose the plan that fits your learning goals/)).toBeInTheDocument()
  })

  it('displays all four pricing plans', () => {
    render(
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <div>
          <h3 className="text-xl font-bold mb-1">Free</h3>
          <p className="text-muted-foreground text-sm mb-4">Perfect to get started</p>
          <div className="mb-6"><span className="text-4xl font-bold">€0</span><span className="text-muted-foreground">/forever</span></div>
          <button className="w-full mb-6 rounded-xl">Start Free</button>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Professional</h3>
          <p className="text-muted-foreground text-sm mb-4">For serious professionals</p>
          <div className="mb-6"><span className="text-4xl font-bold">€29</span><span className="text-muted-foreground">/month</span></div>
          <button className="w-full mb-6 rounded-xl text-white">Start 14-Day Free Trial</button>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Team</h3>
          <p className="text-muted-foreground text-sm mb-4">For teams up to 25 people</p>
          <div className="mb-6"><span className="text-4xl font-bold">€49</span><span className="text-muted-foreground">/user/month</span></div>
          <button className="w-full mb-6 rounded-xl">Try Team Plan</button>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Enterprise</h3>
          <p className="text-muted-foreground text-sm mb-4">For large organizations</p>
          <div className="mb-6"><span className="text-4xl font-bold">Custom</span></div>
          <button className="w-full mb-6 rounded-xl">Request Quote</button>
        </div>
      </div>
    )
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('€0')).toBeInTheDocument()
    expect(screen.getByText('€29')).toBeInTheDocument()
    expect(screen.getByText('€49')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('displays professional plan features', () => {
    const features = [
      { text: 'All courses unlimited', included: true },
      { text: 'Official certificates', included: true },
      { text: 'AI Learning Assistant', included: true },
      { text: 'Downloadable resources', included: true },
      { text: 'Priority support', included: true },
      { text: 'Progress tracking', included: true },
      { text: 'Team dashboards', included: false },
      { text: 'Custom learning paths', included: false },
    ]

    render(
      <div className="space-y-3">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.text}</span>
          </div>
        ))}
      </div>
    )
    expect(screen.getByText('All courses unlimited')).toBeInTheDocument()
    expect(screen.getByText('AI Learning Assistant')).toBeInTheDocument()
    expect(screen.getByText('Priority support')).toBeInTheDocument()
  })

  it('renders monthly/yearly billing toggle', () => {
    render(
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className="font-medium">Monthly</span>
        <input type="checkbox" role="switch" />
        <span className="font-medium text-muted-foreground">Yearly</span>
      </div>
    )
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Yearly')).toBeInTheDocument()
  })

  it('displays individual course pricing section', () => {
    const courses = [
      { name: 'Project Management Fundamentals', price: 0, badge: 'Free' },
      { name: 'Agile & Scrum Mastery', price: 49, badge: null },
      { name: 'PRINCE2 Foundation & Practitioner', price: 149, badge: 'Bestseller' },
    ]

    render(
      <div>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Or buy individual courses</h2>
          <p className="text-muted-foreground">One-time purchase with lifetime access</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {courses.map((course, i) => (
            <div key={i} className="border rounded-xl p-4">
              <h4 className="font-medium text-sm">{course.name}</h4>
              {course.badge && <span>{course.badge}</span>}
              <div className="flex items-baseline gap-2">
                {course.price === 0 ? (
                  <span className="text-lg font-bold">Free</span>
                ) : (
                  <span className="text-lg font-bold">€{course.price}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    expect(screen.getByText('Or buy individual courses')).toBeInTheDocument()
    expect(screen.getByText('One-time purchase with lifetime access')).toBeInTheDocument()
    expect(screen.getByText('Project Management Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Bestseller')).toBeInTheDocument()
  })

  it('renders comparison table header', () => {
    render(
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Compare Plans</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4 font-medium">Feature</th>
              <th className="py-4 px-4 text-center font-medium">Free</th>
              <th className="py-4 px-4 text-center font-medium">Professional</th>
              <th className="py-4 px-4 text-center font-medium">Team</th>
              <th className="py-4 px-4 text-center font-medium">Enterprise</th>
            </tr>
          </thead>
        </table>
      </div>
    )
    expect(screen.getByText('Compare Plans')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
  })

  it('renders FAQ section with questions and answers', () => {
    render(
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="border rounded-xl p-6">
            <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
            <p className="text-muted-foreground text-sm">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
          </div>
          <div className="border rounded-xl p-6">
            <h4 className="font-bold mb-2">Is there a free trial?</h4>
            <p className="text-muted-foreground text-sm">Yes! Professional and Team plans have a 14-day free trial without credit card.</p>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel anytime?')).toBeInTheDocument()
    expect(screen.getByText('Is there a free trial?')).toBeInTheDocument()
  })

  it('displays CTA section at the bottom', () => {
    render(
      <div className="max-w-3xl mx-auto text-center rounded-3xl p-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8">Start your first course today</p>
        <button className="rounded-xl text-white">View Courses</button>
      </div>
    )
    expect(screen.getByText('Ready to get started?')).toBeInTheDocument()
    expect(screen.getByText('Start your first course today')).toBeInTheDocument()
    expect(screen.getByText('View Courses')).toBeInTheDocument()
  })
})

describe('CourseCheckout Page', () => {
  it('renders checkout page heading and navigation', () => {
    render(
      <div className="min-h-screen bg-muted/30">
        <nav className="sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <button>Back to course</button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Secure payment via Stripe</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        </div>
      </div>
    )
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Back to course')).toBeInTheDocument()
    expect(screen.getByText('Secure payment via Stripe')).toBeInTheDocument()
  })

  it('displays your details form with required fields', () => {
    render(
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>1</span> Your Details
        </h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName">First name *</label>
              <input id="firstName" name="firstName" placeholder="First name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName">Last name *</label>
              <input id="lastName" name="lastName" placeholder="Last name" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email">Email address *</label>
            <input id="email" name="email" type="email" placeholder="jouw@email.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="company">Company name (optional)</label>
            <input id="company" name="company" />
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Your Details')).toBeInTheDocument()
    expect(screen.getByLabelText(/First name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company name/)).toBeInTheDocument()
  })

  it('displays payment method selection', () => {
    render(
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>2</span> Payment
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-4 rounded-xl border-2">
            <input type="radio" name="payment" id="card" defaultChecked />
            <label htmlFor="card">Credit / Debit Card</label>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-xl border-2">
            <input type="radio" name="payment" id="ideal" />
            <label htmlFor="ideal">iDEAL</label>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-xl border-2">
            <input type="radio" name="payment" id="bancontact" />
            <label htmlFor="bancontact">Bancontact</label>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-xl border-2">
            <input type="radio" name="payment" id="invoice" />
            <label htmlFor="invoice">Invoice (Enterprise)</label>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByLabelText('Credit / Debit Card')).toBeInTheDocument()
    expect(screen.getByLabelText('iDEAL')).toBeInTheDocument()
    expect(screen.getByLabelText('Bancontact')).toBeInTheDocument()
    expect(screen.getByLabelText('Invoice (Enterprise)')).toBeInTheDocument()
  })

  it('renders order summary with course details and pricing', () => {
    render(
      <div>
        <h2 className="text-lg font-bold">Order Summary</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="font-medium">Agile & Scrum Mastery</h3>
              <p className="text-sm text-muted-foreground">18 modules • 10 uur</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input placeholder="Coupon code" />
            <button>Apply</button>
          </div>
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>€49.00</span></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>VAT (21%)</span><span>€10.29</span></div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t"><span>Total</span><span>€59.29</span></div>
          </div>
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Included:</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Lifetime access</div>
              <div>Certificate</div>
              <div>AI support</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl">
            <div>
              <p className="font-medium text-sm">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>
    )
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
    expect(screen.getByText('Agile & Scrum Mastery')).toBeInTheDocument()
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('VAT (21%)')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('30-day money-back guarantee')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Coupon code')).toBeInTheDocument()
  })

  it('displays terms and conditions checkbox', () => {
    render(
      <div className="flex items-start space-x-3">
        <input type="checkbox" id="terms" />
        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          I agree to the <a href="/terms" className="text-primary hover:underline">terms and conditions</a>
        </label>
      </div>
    )
    expect(screen.getByLabelText(/I agree to the/)).toBeInTheDocument()
    expect(screen.getByText('terms and conditions')).toBeInTheDocument()
  })
})
