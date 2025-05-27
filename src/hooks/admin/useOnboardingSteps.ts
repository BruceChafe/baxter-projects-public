import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import { onboardingStepsByRole } from "../../constants/onboardingSteps";

export type OnboardingStepWithStatus = OnboardingStep & {
  completed: boolean;
  completed_at?: string;
};

export const useOnboardingSteps = (role: string, userId: string | null) => {
  const [steps, setSteps] = useState<OnboardingStepWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!role || !userId) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("user_onboarding")
      .select("step_key, status, completed_at");
    //   .eq("user_id", userId);

    if (error) {
      console.error("Error fetching onboarding status:", error);
      return;
    }

    const statusMap = new Map(
      (data || []).map((entry) => [entry.step_key, entry])
    );

    const roleSteps = onboardingStepsByRole[role] || [];

    const mergedSteps: OnboardingStepWithStatus[] = roleSteps.map((step) => {
      const record = statusMap.get(step.step_key);
      return {
        ...step,
        completed: record?.status === "completed",
        completed_at: record?.completed_at ?? null,
      };
    });

    setSteps(mergedSteps);
    setLoading(false);
  };

const markStepComplete = async (step_key: string) => {
  if (!userId) return;

  const { error } = await supabase
    .from("user_onboarding")
    .upsert(
      {
        user_id: userId,
        step_key,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,step_key",
      }
    );

  if (error) {
    console.error("Error marking step complete:", error);
  } else {
    fetchStatus();
  }
};

  useEffect(() => {
    fetchStatus();
  }, [role, userId]);

  return { steps, loading, markStepComplete };
};
