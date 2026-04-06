import { apiService } from './apiService';

export interface Risk {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  program_id?: string;
  category: string;
  probability: string;
  impact: string;
  score: number;
  status: 'identified' | 'assessed' | 'mitigating' | 'mitigated' | 'closed';
  owner_id?: string;
  owner_name?: string;
  mitigation?: string;
  contingency?: string;
  identified_date: string;
  review_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskData {
  title: string;
  description?: string;
  project_id?: string;
  program_id?: string;
  category: string;
  probability: string;
  impact: string;
  score?: number;
  status?: string;
  mitigation?: string;
  contingency?: string;
  identified_date?: string;
}

export interface UpdateRiskData {
  title?: string;
  description?: string;
  category?: string;
  probability?: string;
  impact?: string;
  score?: number;
  status?: string;
  owner_id?: string;
  mitigation?: string;
  contingency?: string;
  review_date?: string;
}

class RisksService {
  // ==================== RISKS CRUD ====================

  /**
   * Get all risks
   */
  async getRisks(): Promise<Risk[]> {
    try {
      const response = await apiService.get('/risks/');
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch risks:', error);
      throw error;
    }
  }

  /**
   * Get risks for a specific project
   */
  async getRisksByProject(projectId: string): Promise<Risk[]> {
    try {
      const response = await apiService.get(`/risks/?project_id=${projectId}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch project risks:', error);
      throw error;
    }
  }

  /**
   * Get risks for a specific program
   */
  async getRisksByProgram(programId: string): Promise<Risk[]> {
    try {
      const response = await apiService.get(`/risks/?program_id=${programId}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch program risks:', error);
      throw error;
    }
  }

  /**
   * Get a single risk by ID
   */
  async getRisk(id: string): Promise<Risk> {
    try {
      const response = await apiService.get(`/risks/${id}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch risk:', error);
      throw error;
    }
  }

  /**
   * Create a new risk
   */
  async createRisk(data: CreateRiskData): Promise<Risk> {
    try {
      // Calculate score if not provided
      const score = data.score || this.calculateScore(data.probability, data.impact);
      
      const response = await apiService.post('/risks/', {
        ...data,
        score,
        status: data.status || 'identified',
        identified_date: data.identified_date || new Date().toISOString().split('T')[0],
      });
      return response;
    } catch (error) {
      console.error('Failed to create risk:', error);
      throw error;
    }
  }

  /**
   * Update an existing risk
   */
  async updateRisk(id: string, data: UpdateRiskData): Promise<Risk> {
    try {
      // Recalculate score if probability or impact changed
      let updateData = { ...data };
      if (data.probability || data.impact) {
        const currentRisk = await this.getRisk(id);
        const probability = data.probability || currentRisk.probability;
        const impact = data.impact || currentRisk.impact;
        updateData.score = this.calculateScore(probability, impact);
      }
      
      const response = await apiService.patch(`/risks/${id}/`, updateData);
      return response;
    } catch (error) {
      console.error('Failed to update risk:', error);
      throw error;
    }
  }

  /**
   * Delete a risk
   */
  async deleteRisk(id: string): Promise<void> {
    try {
      await apiService.delete(`/risks/${id}/`);
    } catch (error) {
      console.error('Failed to delete risk:', error);
      throw error;
    }
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Update risk status
   */
  async updateStatus(id: string, status: Risk['status']): Promise<Risk> {
    return this.updateRisk(id, { status });
  }

  /**
   * Mark risk as mitigated
   */
  async mitigateRisk(id: string, mitigationNotes?: string): Promise<Risk> {
    return this.updateRisk(id, { 
      status: 'mitigated',
      mitigation: mitigationNotes,
    });
  }

  /**
   * Close a risk
   */
  async closeRisk(id: string): Promise<Risk> {
    return this.updateRisk(id, { status: 'closed' });
  }

  /**
   * Reopen a closed risk
   */
  async reopenRisk(id: string): Promise<Risk> {
    return this.updateRisk(id, { status: 'identified' });
  }

  // ==================== ANALYTICS ====================

  /**
   * Get risk statistics for a project
   */
  async getProjectRiskStats(projectId: string): Promise<{
    total: number;
    by_status: Record<string, number>;
    by_level: Record<string, number>;
    avg_score: number;
  }> {
    try {
      const response = await apiService.get(`/risks/stats/?project_id=${projectId}`);
      return response;
    } catch (error) {
      // Calculate locally if endpoint doesn't exist
      console.warn('Stats endpoint not found, calculating locally');
      const risks = await this.getRisksByProject(projectId);
      return this.calculateStats(risks);
    }
  }

  /**
   * Get high priority risks (critical and high)
   */
  async getHighPriorityRisks(): Promise<Risk[]> {
    try {
      const response = await apiService.get('/risks/?min_score=11');
      return response.results || response || [];
    } catch (error) {
      // Filter locally if endpoint doesn't support filtering
      const risks = await this.getRisks();
      return risks.filter(r => (r.score || 0) >= 11);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate risk score from probability and impact
   */
  calculateScore(probability: string, impact: string): number {
    const probValues: Record<string, number> = {
      'very_low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very_high': 5,
      'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5,
    };
    const impactValues: Record<string, number> = {
      'very_low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very_high': 5,
      'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5,
    };
    
    const probValue = probValues[probability] || 3;
    const impactValue = impactValues[impact] || 3;
    
    return probValue * impactValue;
  }

  /**
   * Get risk level label from score
   */
  getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score <= 4) return 'low';
    if (score <= 10) return 'medium';
    if (score <= 15) return 'high';
    return 'critical';
  }

  /**
   * Get risk level color
   */
  getRiskLevelColor(score: number): string {
    if (score <= 4) return '#10B981'; // green
    if (score <= 10) return '#F59E0B'; // yellow/amber
    if (score <= 15) return '#F97316'; // orange
    return '#EF4444'; // red
  }

  /**
   * Calculate statistics from risks array
   */
  private calculateStats(risks: Risk[]): {
    total: number;
    by_status: Record<string, number>;
    by_level: Record<string, number>;
    avg_score: number;
  } {
    const by_status: Record<string, number> = {};
    const by_level: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    let totalScore = 0;

    risks.forEach(risk => {
      // Count by status
      by_status[risk.status] = (by_status[risk.status] || 0) + 1;
      
      // Count by level
      const level = this.getRiskLevel(risk.score || 0);
      by_level[level]++;
      
      // Sum scores
      totalScore += risk.score || 0;
    });

    return {
      total: risks.length,
      by_status,
      by_level,
      avg_score: risks.length > 0 ? Math.round(totalScore / risks.length) : 0,
    };
  }

  /**
   * Format risk for display
   */
  formatRiskSummary(risk: Risk): string {
    const level = this.getRiskLevel(risk.score || 0);
    return `${risk.title} (${level.toUpperCase()}, Score: ${risk.score})`;
  }
}

export const risksService = new RisksService();