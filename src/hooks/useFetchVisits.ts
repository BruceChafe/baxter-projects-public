import { useState, useCallback } from "react";
import axiosInstance from "../axios";

interface Contact {
  first_name: string;
  last_name: string;
  driversLicenses: { imageUrl: string | null }[];
}

interface VisitData {
  id: number;
  dateOfVisit: string;
  dealership_id: number;
  salesConsultant: string;
  contact: Contact | null;
}

export const useFetchVisits = () => {
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(
    async (dealership_id: number | "", timeRange: string, salesConsultant: string) => {
      if (!dealership_id) return;
  
      setLoading(true);
      setError(null);
  
      try {
        const { data } = await axiosInstance.get("/visits", {
          params: { dealership_id, timeRange },
        });
  
        const processedData = data.map((visit) => ({
          ...visit,
          contact: {
            ...visit.contact,
            driversLicenses: visit.contact?.driversLicenses || [],
          },
        }));
  
        setVisits(
          salesConsultant
            ? processedData.filter((visit) => visit.salesConsultant === salesConsultant)
            : processedData
        );
      } catch (err) {
        console.error("Error fetching visits:", err);
        setError("Failed to fetch visits. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );
  

  return { visits, loading, error, fetchVisits };
};
