import { useState, useEffect } from "react";
import axiosInstance from "../axios";
import { Dealership } from "../types";
import { useAuth } from "../context/AuthContext";

const useFetchDealerships = (dealergroup_id?: number) => {
  const { sqlUser } = useAuth();
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealerships = async () => {
      if (!dealergroup_id && !sqlUser?.dealergroup_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/dealerships`, {
          params: { dealergroup_id: dealergroup_id || sqlUser?.dealergroup_id },
        });

        setDealerships(response.data);
        setError(null); // Clear any previous error
      } catch (err: any) {
        console.error("Error fetching dealerships:", err);
        setError("Failed to load dealerships. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false here
      }
    };

    fetchDealerships();
  }, [dealergroup_id, sqlUser?.dealergroup_id]);

  return { dealerships, loading, error, setDealerships, setError };
};

export default useFetchDealerships;
