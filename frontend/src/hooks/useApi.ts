import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, timeEntriesApi, teamApi } from '@/lib/api';

// Projects Hooks
export const useProjects = (params?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getAll(params),
  });
};

export const useProject = (id: string | number | undefined) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

// Time Entries Hooks
export const useTimeEntries = (params?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: ['time-entries', params],
    queryFn: () => timeEntriesApi.getAll(params),
  });
};

export const useMyTimeEntries = (params?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: ['my-time-entries', params],
    queryFn: () => timeEntriesApi.getMine(params),
  });
};

export const useTimeEntrySummary = (projectId?: string | number) => {
  return useQuery({
    queryKey: ['time-entry-summary', projectId],
    queryFn: () => timeEntriesApi.getSummary(projectId),
  });
};

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: timeEntriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['my-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entry-summary'] });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: timeEntriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['my-time-entries'] });
    },
  });
};

// Team Hooks
export const useTeam = () => {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.getAll(),
  });
};
