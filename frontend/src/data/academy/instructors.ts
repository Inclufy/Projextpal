// ============================================
// INSTRUCTORS
// ============================================
// All academy instructors
// ============================================

export interface Instructor {
  name: string;
  title: string;
  avatar: string;
  bio?: string;
  expertise?: string[];
  students?: number;
  courses?: number;
  rating?: number;
}

// ============================================
// INSTRUCTOR DEFINITIONS
// ============================================

export const instructors = {
  // PM Fundamentals Instructor
  jan: {
    name: 'Jan de Vries',
    title: 'Senior Project Manager, PMP',
    avatar: 'JV',
    bio: 'Jan is een ervaren project manager met meer dan 15 jaar ervaring in IT en constructie projecten bij bedrijven als Shell, KPN en Rijkswaterstaat.',
    expertise: ['Project Management', 'Agile', 'PRINCE2', 'PMP'],
    students: 12500,
    courses: 6,
    rating: 4.8,
  } as Instructor,

  // PRINCE2 Instructor
  peter: {
    name: 'Peter de Vries',
    title: 'PRINCE2 Practitioner, Senior PM',
    avatar: 'PV',
    bio: 'Peter is PRINCE2 Practitioner en Senior Project Manager met uitgebreide ervaring bij overheidsprojecten en enterprise transformaties.',
    expertise: ['PRINCE2', 'MSP', 'Governance', 'Risk Management'],
    students: 8900,
    courses: 4,
    rating: 4.7,
  } as Instructor,

  // Scrum Instructor
  lisa: {
    name: 'Lisa de Groot',
    title: 'Professional Scrum Trainer, PSM III',
    avatar: 'LG',
    bio: 'Lisa is Professional Scrum Trainer bij Scrum.org met meer dan 10 jaar ervaring in Agile transformaties bij scale-ups en enterprises.',
    expertise: ['Scrum', 'Agile Coaching', 'Team Facilitation', 'Product Management'],
    students: 15678,
    courses: 5,
    rating: 4.9,
  } as Instructor,

  // Kanban Instructor
  anna: {
    name: 'Anna Bakker',
    title: 'Accredited Kanban Trainer (AKT)',
    avatar: 'AB',
    bio: 'Anna is Accredited Kanban Trainer bij Kanban University en heeft meer dan 50 teams geholpen met Kanban implementaties bij Booking.com, Adyen en diverse scale-ups.',
    expertise: ['Kanban', 'Flow', 'Lean', 'Agile Coaching'],
    students: 15000,
    courses: 4,
    rating: 4.7,
  } as Instructor,

  // Agile Fundamentals Instructor
  martijn: {
    name: 'Martijn van Dijk',
    title: 'Enterprise Agile Coach, ICAgile Authorized Instructor',
    avatar: 'MD',
    bio: 'Martijn is Enterprise Agile Coach met 15 jaar ervaring in Agile transformaties bij organisaties als ABN AMRO, KLM en Unilever.',
    expertise: ['Agile', 'SAFe', 'Organizational Change', 'Leadership'],
    students: 25000,
    courses: 7,
    rating: 4.8,
  } as Instructor,

  // Lean Six Sigma Instructor
  mark: {
    name: 'Dr. Mark Jansen',
    title: 'Master Black Belt, Lean Six Sigma Consultant',
    avatar: 'MJ',
    bio: 'Dr. Mark Jansen is Master Black Belt met 18 jaar ervaring in procesverbetering bij bedrijven als Philips, ASML en DSM. Hij heeft meer dan 100 verbeterprojecten geleid met een totale besparing van €50+ miljoen.',
    expertise: ['Lean Six Sigma', 'Statistical Analysis', 'Change Management', 'Process Excellence'],
    students: 18000,
    courses: 5,
    rating: 4.7,
  } as Instructor,
};

// Export individual instructors for convenience
export const { jan, peter, lisa, anna, martijn, mark } = instructors;

export default instructors;