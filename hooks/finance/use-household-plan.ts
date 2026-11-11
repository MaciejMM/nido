"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  copyHouseholdPlanFromPrevious,
  createHouseholdLine,
  deleteHouseholdLine,
  fetchHouseholdPlan,
  updateHouseholdLine,
  updateHouseholdSettings,
} from "@/lib/household-plan-api-client";
import type {
  CopyHouseholdPlanInput,
  CreateHouseholdLineInput,
  HouseholdPlanDto,
  PersonalInclusionMode,
  UpdateHouseholdLineInput,
} from "@/types";

import { financeKeys } from "./query-keys";

export function useHouseholdPlan(
  year: number,
  month: number,
  initialData?: HouseholdPlanDto,
) {
  const queryClient = useQueryClient();
  const queryKey = financeKeys.household(year, month);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchHouseholdPlan(year, month),
    initialData,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: financeKeys.household(year, month) });

  const createMutation = useMutation({
    mutationFn: (input: CreateHouseholdLineInput) => createHouseholdLine(input),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHouseholdLineInput }) =>
      updateHouseholdLine(id, input),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHouseholdLine(id),
    onSuccess: () => invalidate(),
  });

  const settingsMutation = useMutation({
    mutationFn: (personalInclusion: PersonalInclusionMode) =>
      updateHouseholdSettings({ year, month, personalInclusion }),
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKey, plan);
    },
  });

  const copyMutation = useMutation({
    mutationFn: (input: CopyHouseholdPlanInput) =>
      copyHouseholdPlanFromPrevious(input),
    onSuccess: () => invalidate(),
  });

  return {
    plan: query.data,
    loading: query.isLoading,
    addLine: createMutation.mutateAsync,
    editLine: (id: string, input: UpdateHouseholdLineInput) =>
      updateMutation.mutateAsync({ id, input }),
    removeLine: deleteMutation.mutateAsync,
    setPersonalInclusion: settingsMutation.mutateAsync,
    copyFromPrevious: copyMutation.mutateAsync,
    isCopying: copyMutation.isPending,
    isUpdatingInclusion: settingsMutation.isPending,
  };
}
