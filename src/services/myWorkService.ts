import { apiService } from './apiService';

export interface MyWorkTask {
  id: number;
  title: string;
  due_date: string | null;
  priority: string;
  status: string;
  category: string;
  project_id: number | null;
  project_name: string | null;
  methodology: string | null;
  url: string;
}

export interface MyWorkMention {
  id: number;
  body: string;
  author: string | null;
  project_name: string | null;
  where: string;
  url: string;
  created_at: string;
}

export interface MyWorkData {
  buckets: {
    overdue: MyWorkTask[];
    today: MyWorkTask[];
    this_week: MyWorkTask[];
    later: MyWorkTask[];
    no_date: MyWorkTask[];
  };
  counts: { open: number; overdue: number; today: number; mentions: number };
  mentions: MyWorkMention[];
  generated_at: string;
}

const EMPTY: MyWorkData = {
  buckets: { overdue: [], today: [], this_week: [], later: [], no_date: [] },
  counts: { open: 0, overdue: 0, today: 0, mentions: 0 },
  mentions: [],
  generated_at: '',
};

class MyWorkService {
  async getMyWork(): Promise<MyWorkData> {
    try {
      const r = await apiService.get<any>('/api/v1/projects/my-work/');
      return { ...EMPTY, ...(r || {}) };
    } catch (error) {
      console.error('Failed to fetch My Work:', error);
      return EMPTY;
    }
  }
}

export const myWorkService = new MyWorkService();
