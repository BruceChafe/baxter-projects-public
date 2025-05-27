import { useState } from "react";
import axiosInstance from "../axios";

const useDealershipUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDealership = async (dealership_id: number, updatedData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.put(`/dealerships/${dealership_id}`, updatedData);
      return response.data;  // Return updated dealership data
    } catch (err) {
      setError('Failed to update dealership information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateDealership,
    loading,
    error,
  };
};

export default useDealershipUpdate;
