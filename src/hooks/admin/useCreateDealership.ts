import { useState } from "react";

export interface Dealership {
  id: string;
  name: string;
  dealergroup_id: string;
  // Add other fields if needed
}

export const useCreateDealership = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDealership = async (
    name: string,
    dealerGroupId: string
  ): Promise<Dealership> => {
    setLoading(true);
    setError(null);

    try {
      // Get current session info
      const {
        data: { session },
        error: sessionError,
      } = await supa.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Session not found. Please log in again.");
      }

      // Prepare the payload.
      // The request payload uses snake_case for the database column.
      const payload = {
        name,
        dealergroup_id: dealerGroupId,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createDealership`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create dealership");
      }

      return result.dealership;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createDealership, loading, error };
};
