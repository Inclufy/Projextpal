import { apiService } from './apiService';

// ==================== TypeScript Interfaces ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    type?: 'text' | 'action' | 'report';
    data?: any;
  };
}

export interface AIResponse {
  message: ChatMessage;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface AIContext {
  user_id?: string;
  project_id?: string;
  context_type?: 'general' | 'project' | 'task' | 'risk';
  metadata?: Record<string, any>;
}

// ==================== AI Service ====================

class AIService {
  private currentSessionId: string | null = null;
  private context: AIContext = {};

  // ========== Session Management ==========

  /**
   * Create a new chat session
   */
  async createSession(contextType: 'general' | 'project' | 'task' | 'risk' = 'general'): Promise<string> {
    try {
      const response = await apiService.post<{ session_id: string }>('/api/v1/ai/sessions/', {
        context_type: contextType,
      });
      this.currentSessionId = response.session_id;
      return this.currentSessionId;
    } catch (error) {
      // Use console.log to avoid crash screen
      console.log('AI backend not available, using local session');
      
      // Fallback to local session ID
      this.currentSessionId = `local-${Date.now()}`;
      return this.currentSessionId;
    }
  }

  /**
   * Get chat sessions
   */
  async getSessions(): Promise<ChatSession[]> {
    try {
      const response = await apiService.get<any>('/api/v1/ai/sessions/');
      return response.results || response || [];
    } catch (error) {
      console.log('Failed to fetch sessions, returning empty array');
      return [];
    }
  }

  /**
   * Get messages from a session
   */
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiService.get<any>(`/api/v1/ai/sessions/${sessionId}/messages/`);
      return response.results || response || [];
    } catch (error) {
      console.log('Failed to fetch session messages, returning empty array');
      return [];
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await apiService.delete(`/api/v1/ai/sessions/${sessionId}/`);
    } catch (error) {
      console.log('Failed to delete session');
      throw error;
    }
  }

  // ========== Message Handling ==========

  /**
   * Send a message and get AI response
   */
  async sendMessage(message: string, context?: AIContext): Promise<AIResponse> {
    try {
      // Merge context
      const fullContext = { ...this.context, ...context };

      const response = await apiService.post<AIResponse>('/api/v1/ai/chat/', {
        message,
        session_id: this.currentSessionId,
        context: fullContext,
      });

      return response;
    } catch (error) {
      // Use console.log to avoid crash screen
      console.log('AI backend not available, using fallback response');
      
      // Fallback response with helpful message
      return {
        message: {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but the AI service is currently unavailable. The AI chat feature requires backend support that hasn\'t been set up yet. Please contact your administrator to enable AI features.',
          timestamp: new Date().toISOString(),
        },
        suggestions: [],
      };
    }
  }

  /**
   * Set context for AI responses
   */
  setContext(context: AIContext): void {
    this.context = context;
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  // ========== Specialized AI Functions ==========

  /**
   * Generate project report
   */
  async generateProjectReport(projectId: string): Promise<string> {
    try {
      const response = await apiService.post<{ report: string }>('/api/v1/ai/generate-report/', {
        project_id: projectId,
      });
      return response.report;
    } catch (error) {
      console.log('Failed to generate report - AI backend not available');
      throw new Error('AI report generation is currently unavailable');
    }
  }

  /**
   * Analyze project risks
   */
  async analyzeRisks(projectId: string): Promise<any> {
    try {
      const response = await apiService.post<any>('/api/v1/ai/analyze-risks/', {
        project_id: projectId,
      });
      return response;
    } catch (error) {
      console.log('Failed to analyze risks - AI backend not available');
      throw new Error('AI risk analysis is currently unavailable');
    }
  }

  /**
   * Get AI suggestions for project improvement
   */
  async getProjectSuggestions(projectId: string): Promise<string[]> {
    try {
      const response = await apiService.post<{ suggestions: string[] }>('/api/v1/ai/suggestions/', {
        project_id: projectId,
      });
      return response.suggestions || [];
    } catch (error) {
      console.log('Failed to get suggestions - AI backend not available');
      return [];
    }
  }

  /**
   * Parse natural language to create task
   */
  async parseTaskFromText(text: string): Promise<any> {
    try {
      const response = await apiService.post<any>('/api/v1/ai/parse-task/', {
        text,
      });
      return response;
    } catch (error) {
      console.log('Failed to parse task - AI backend not available');
      throw new Error('AI task parsing is currently unavailable');
    }
  }

  // ========== Utility Methods ==========

  /**
   * Format timestamp for display in chat
   * Shows relative time for recent messages, time for today, date for older messages
   */
  formatTimestamp(timestamp: string, isNL: boolean = false): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // Check for invalid date
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      
      // Just now (< 1 minute)
      if (diffInMinutes < 1) return isNL ? 'Zojuist' : 'Just now';
      
      // Minutes ago (< 1 hour)
      if (diffInMinutes < 60) return `${diffInMinutes}m ${isNL ? 'geleden' : 'ago'}`;
      
      // Hours ago (< 24 hours)
      if (diffInHours < 24) return `${diffInHours}u ${isNL ? 'geleden' : 'ago'}`;
      
      // Same day - show time
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString(isNL ? 'nl-NL' : 'en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // Different day - show date
      return date.toLocaleDateString(isNL ? 'nl-NL' : 'en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.log('Error formatting timestamp:', error);
      return '';
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Check if AI backend is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      await apiService.get('/api/v1/ai/health/');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// ==================== Export Singleton ====================

export const aiService = new AIService();