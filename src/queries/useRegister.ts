import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CbcGraduate,
  CbcGraduatePatch,
  CbcOutcome,
  MisData,
  NewCbcGraduate,
  NewCbcOutcome,
  RegisterFilters,
  RegisterPage,
} from '../types/mis';
import { registerBlankRow } from '../lib/registerColumns';
import {
  createCbcGraduate,
  createCbcOutcome,
  createRegisterStudent,
  exportRegisterEdits,
  fetchRegisterPage,
  fetchSchools,
  isBackendConfigured,
  patchCbcGraduate,
  resolveQualityIssue,
  saveRegisterCell,
} from '../lib/api';
import { queryKeys } from './keys';

export interface CellEdit {
  uid: string;
  key: string;
  value: string | null;
}

/** School names for the register filter dropdown. */
export function useSchools() {
  return useQuery<string[]>({
    queryKey: queryKeys.schools,
    queryFn: ({ signal }) => fetchSchools(signal),
    staleTime: isBackendConfigured ? 60_000 : Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: isBackendConfigured ? 2 : 1,
  });
}

/**
 * One paginated register page. In UI-only mode the filters run against the
 * snapshot; with a backend they become query params on GET /mis/students.
 */
export function useRegisterPage(filters: RegisterFilters = {}) {
  return useQuery<RegisterPage>({
    queryKey: queryKeys.registerPage(
      filters as Record<string, string | number | boolean | undefined>,
    ),
    queryFn: ({ signal }) => fetchRegisterPage(filters, signal),
    staleTime: isBackendConfigured ? 30_000 : Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: isBackendConfigured ? 2 : 1,
    placeholderData: (prev) => prev,
  });
}

/**
 * Download the session's register edits as CSV. UI-only: built locally;
 * backend: POSTed to /mis/students/export and downloaded from the response.
 */
export function useExportRegisterEdits() {
  return useMutation({
    mutationFn: async (vars: {
      edits: Array<{ uid: string; field: string; value: string | null }>;
      localRows: MisData['roster'];
    }) => {
      const blob = await exportRegisterEdits(vars.edits, vars.localRows);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vf_register_edits.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

/** CBC: create a graduate record, then refresh graduate lists. */
export function useCreateCbcGraduate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewCbcGraduate) => createCbcGraduate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cbcGraduates() });
      qc.invalidateQueries({ queryKey: queryKeys.cbcSummary });
    },
  });
}

/** CBC: patch a graduate record, then refresh graduate lists. */
export function usePatchCbcGraduate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: CbcGraduatePatch }) =>
      patchCbcGraduate(vars.id, vars.patch),
    onSuccess: (_data: CbcGraduate) => {
      qc.invalidateQueries({ queryKey: queryKeys.cbcGraduates() });
      qc.invalidateQueries({ queryKey: queryKeys.cbcSummary });
    },
  });
}

/** CBC: record an outcome, then refresh outcomes + summary. */
export function useCreateCbcOutcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewCbcOutcome) => createCbcOutcome(input),
    onSuccess: (_data: CbcOutcome) => {
      qc.invalidateQueries({ queryKey: queryKeys.cbcOutcomes() });
      qc.invalidateQueries({ queryKey: queryKeys.cbcSummary });
    },
  });
}

/** Quality: mark an issue resolved, then refresh issue lists + summary. */
export function useResolveQualityIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveQualityIssue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.qualityIssues() });
      qc.invalidateQueries({ queryKey: queryKeys.qualitySummary });
    },
  });
}

/** The set of `uid|field` pairs edited in this session. */
export function useRegisterEdits() {
  return useQuery<string[]>({
    queryKey: queryKeys.registerEdits,
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Commits a single edited cell. The cache is updated optimistically so the UI
 * is instant; when a backend is configured the write is sent and rolled back
 * (see `onError`) if it fails. In UI-only mode the write is a local no-op and
 * the optimistic value simply stands.
 */
export function useSaveCell() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (edit: CellEdit) =>
      saveRegisterCell({ uid: edit.uid, field: edit.key, value: edit.value }),
    onMutate: (edit: CellEdit) => {
      const previous = qc.getQueryData<MisData>(queryKeys.dashboard);
      if (!previous) return { previous };

      const row = previous.roster.find((r) => r.uid === edit.uid);
      if (!row) return { previous };
      if ((row as unknown as Record<string, unknown>)[edit.key] === edit.value) {
        return { previous };
      }

      qc.setQueryData<MisData>(queryKeys.dashboard, {
        ...previous,
        roster: previous.roster.map((r) =>
          r.uid === edit.uid ? { ...r, [edit.key]: edit.value } : r,
        ),
      });
      qc.setQueryData<string[]>(queryKeys.registerEdits, (old = []) => {
        const k = `${edit.uid}|${edit.key}`;
        return old.includes(k) ? old : [...old, k];
      });

      return { previous };
    },
    onError: (_error, _edit, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.dashboard, context.previous);
      }
    },
    onSuccess: () => {
      if (isBackendConfigured) {
        qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      }
    },
  });
}

/** Prepends a fresh blank student row, exactly like the original "Add student". */
export function useAddStudent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => createRegisterStudent(),
    onMutate: () => {
      const previous = qc.getQueryData<MisData>(queryKeys.dashboard);
      if (!previous) return { previous };

      const n = previous.roster.filter((r) => r.uid.startsWith('VF-NEW')).length + 1;
      const row = registerBlankRow(`VF-NEW-${String(n).padStart(4, '0')}`);
      qc.setQueryData<MisData>(queryKeys.dashboard, {
        ...previous,
        roster: [row, ...previous.roster],
      });

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.dashboard, context.previous);
      }
    },
    onSuccess: () => {
      if (isBackendConfigured) {
        qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      }
    },
  });
}

