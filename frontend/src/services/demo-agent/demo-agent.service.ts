// src/services/demo-agent/demo-agent.service.ts
// ProjectPal Demo Environment service — calls Django backend API
import api from '@/lib/api';
import type { DemoIndustry, DemoStatus, DemoSeedResult, SeedProgress } from './types';

type ProgressCallback = (progress: SeedProgress) => void;

class ProjectPalDemoAgentService {
  private activeIndustry: string | null = null;

  // ── Fallback industries (used when API unavailable) ──────────────
  private static readonly FALLBACK_INDUSTRIES: DemoIndustry[] = [
    { id: 'IT & Software', name: 'IT & Software', color: '#8B5CF6', icon: 'Cloud' },
    { id: 'Bouw & Constructie', name: 'Bouw & Constructie', color: '#F59E0B', icon: 'HardHat' },
    { id: 'Zorg & Welzijn', name: 'Zorg & Welzijn', color: '#0EA5E9', icon: 'Heart' },
    { id: 'Financiële Dienstverlening', name: 'Financiële Dienstverlening', color: '#10B981', icon: 'Building2' },
    { id: 'Consultancy', name: 'Consultancy', color: '#6366F1', icon: 'Briefcase' },
    { id: 'Retail & E-commerce', name: 'Retail & E-commerce', color: '#EF4444', icon: 'ShoppingCart' },
    { id: 'Onderwijs', name: 'Onderwijs', color: '#EC4899', icon: 'GraduationCap' },
  ];

  getAvailableIndustries(): DemoIndustry[] {
    return ProjectPalDemoAgentService.FALLBACK_INDUSTRIES;
  }

  async fetchIndustries(): Promise<DemoIndustry[]> {
    try {
      const data = await api.get<{ industries: DemoIndustry[] }>('/onboarding/demo/industries/');
      return data.industries;
    } catch {
      return this.getAvailableIndustries();
    }
  }

  // ── Active industry ──────────────────────────────────────────────
  async getActiveIndustry(): Promise<string | null> {
    if (this.activeIndustry) return this.activeIndustry;
    const stored = localStorage.getItem('demo_active_industry_projectpal');
    if (stored) {
      this.activeIndustry = stored;
      return stored;
    }
    // Try fetching from API
    try {
      const status = await this.getDemoStatus();
      if (status.active_industry) {
        this.setActiveIndustry(status.active_industry);
        return status.active_industry;
      }
    } catch {
      // API unavailable
    }
    return null;
  }

  private setActiveIndustry(industry: string | null): void {
    this.activeIndustry = industry;
    if (industry) {
      localStorage.setItem('demo_active_industry_projectpal', industry);
    } else {
      localStorage.removeItem('demo_active_industry_projectpal');
    }
  }

  // ── Demo status ──────────────────────────────────────────────────
  async getDemoStatus(): Promise<DemoStatus> {
    return api.get<DemoStatus>('/onboarding/demo/status/');
  }

  // ── Seed demo data ───────────────────────────────────────────────
  async seedIndustryDemo(
    industry: string,
    onProgress?: ProgressCallback,
  ): Promise<DemoSeedResult> {
    const steps = [
      'Projecten aanmaken...',
      'Milestones genereren...',
      'Taken toewijzen...',
      'Risico\'s identificeren...',
      'Afronden...',
    ];

    // Report progress steps (frontend simulation since backend is synchronous)
    for (let i = 0; i < steps.length - 1; i++) {
      onProgress?.({ step: steps[i], total: steps.length, current: i + 1, status: 'running' });
      await new Promise((r) => setTimeout(r, 300));
    }

    try {
      const result = await api.post<DemoSeedResult>('/onboarding/demo/seed/', { industry });
      this.setActiveIndustry(industry);
      onProgress?.({ step: 'Klaar!', total: steps.length, current: steps.length, status: 'done' });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onProgress?.({ step: 'Fout', total: steps.length, current: steps.length, status: 'error', error: message });
      throw err;
    }
  }

  // ── Reset demo data ──────────────────────────────────────────────
  async resetDemo(onProgress?: ProgressCallback): Promise<void> {
    onProgress?.({ step: 'Demo data verwijderen...', total: 2, current: 1, status: 'running' });

    try {
      await api.post('/onboarding/demo/reset/');
      this.setActiveIndustry(null);
      onProgress?.({ step: 'Demo gereset', total: 2, current: 2, status: 'done' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onProgress?.({ step: 'Fout', total: 2, current: 2, status: 'error', error: message });
      throw err;
    }
  }

  // ── Switch industry (reset + reseed) ─────────────────────────────
  async switchIndustry(
    industry: string,
    onProgress?: ProgressCallback,
  ): Promise<DemoSeedResult> {
    onProgress?.({ step: 'Bestaande data verwijderen...', total: 3, current: 1, status: 'running' });
    await new Promise((r) => setTimeout(r, 300));

    onProgress?.({ step: 'Nieuwe branche data laden...', total: 3, current: 2, status: 'running' });

    try {
      const result = await api.post<DemoSeedResult>('/onboarding/demo/switch/', { industry });
      this.setActiveIndustry(industry);
      onProgress?.({ step: 'Klaar!', total: 3, current: 3, status: 'done' });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onProgress?.({ step: 'Fout', total: 3, current: 3, status: 'error', error: message });
      throw err;
    }
  }

  // ── Check if demo data exists ────────────────────────────────────
  async hasDemoData(): Promise<boolean> {
    try {
      const status = await this.getDemoStatus();
      return status.has_data;
    } catch {
      return false;
    }
  }
}

export const projectPalDemoAgentService = new ProjectPalDemoAgentService();
export default projectPalDemoAgentService;
