// Land on the methodology-specific overview, not the generic Foundation page.
// Mirrors the per-methodology Overview routes in AppSidebar's getMethodologyPhases.
export const methodologyOverviewPath = (id: string | number, methodology?: string | null): string => {
  switch ((methodology || '').toLowerCase()) {
    case 'scrum': return `/projects/${id}/scrum/overview`;
    case 'kanban': return `/projects/${id}/kanban/overview`;
    case 'agile': return `/projects/${id}/agile/overview`;
    case 'waterfall': return `/projects/${id}/waterfall/overview`;
    case 'prince2': return `/projects/${id}/prince2/dashboard`;
    case 'lean_six_sigma_green': return `/projects/${id}/lss-green/overview`;
    case 'lean_six_sigma_black': return `/projects/${id}/lss-black/overview`;
    case 'hybrid': return `/projects/${id}/hybrid/overview`;
    // Inclufy Best Practice is the curated default methodology — its home IS
    // the Foundation overview by design (not the unknown-methodology fallback).
    case 'inclufy': return `/projects/${id}/foundation/overview`;
    default: return `/projects/${id}/foundation/overview`;
  }
};
