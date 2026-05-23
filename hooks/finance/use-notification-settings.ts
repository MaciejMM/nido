"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchNotificationSettings,
  sendTestPush,
  updateNotificationSettings,
} from "@/lib/finance-api-client";
import type { UpdateNotificationSettingsInput } from "@/types";

import { financeKeys } from "./query-keys";

export function useNotificationSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: financeKeys.notificationSettings,
    queryFn: fetchNotificationSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateNotificationSettingsInput) =>
      updateNotificationSettings(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: financeKeys.notificationSettings,
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: sendTestPush,
  });

  return {
    settings: query.data,
    loading: query.isLoading,
    saveSettings: updateMutation.mutateAsync,
    sendTest: testMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    isTesting: testMutation.isPending,
  };
}
