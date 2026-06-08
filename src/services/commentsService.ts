import { apiService } from './apiService';

export interface Comment {
  id: number;
  project: number;
  task: number | null;
  target_type: string | null;
  target_id: number | null;
  body: string;
  author: number | null;
  author_name: string | null;
  author_email: string | null;
  created_at: string;
  mention_user_ids?: number[];
}

export interface CommentTarget {
  projectId: string | number;
  taskId?: string | number;
  targetType?: string;   // 'risk' | 'issue' | ...
  targetId?: string | number;
}

class CommentsService {
  async list(t: CommentTarget): Promise<Comment[]> {
    try {
      const params = new URLSearchParams();
      if (t.taskId) params.set('task', String(t.taskId));
      else if (t.targetType && t.targetId != null) {
        params.set('target_type', t.targetType);
        params.set('target_id', String(t.targetId));
      } else params.set('project', String(t.projectId));
      const r = await apiService.get<any>(`/api/v1/comments/?${params.toString()}`);
      return r.results || r || [];
    } catch (e) {
      console.error('Failed to load comments:', e);
      return [];
    }
  }

  async add(t: CommentTarget, body: string, mentionUserIds: number[] = []): Promise<Comment | null> {
    try {
      const payload: any = { project: Number(t.projectId), body, mention_user_ids: mentionUserIds };
      if (t.taskId) payload.task = Number(t.taskId);
      else if (t.targetType && t.targetId != null) {
        payload.target_type = t.targetType;
        payload.target_id = Number(t.targetId);
      }
      return await apiService.post('/api/v1/comments/', payload);
    } catch (e) {
      console.error('Failed to post comment:', e);
      return null;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/api/v1/comments/${id}/`);
      return true;
    } catch {
      return false;
    }
  }
}

export const commentsService = new CommentsService();
