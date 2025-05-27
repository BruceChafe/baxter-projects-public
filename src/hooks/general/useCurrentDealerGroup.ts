import { useAuth } from "../../context/AuthContext";

export const useCurrentDealerGroup = (): string | null => {
  const { user, accessContext } = useAuth();

  const dgId =
    user?.user_metadata?.dealergroup_id ||
    user?.raw_user_meta_data?.dealergroup_id ||
    null;

  return dgId;
};
