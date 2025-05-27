import { useState } from "react";
import axiosInstance from "../axios";
import { License } from "../types";

const useFetchDealershipLicenses = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [dealershipLicenses, setDealershipLicenses] = useState<number[]>([]);

  // Fetch licenses for a dealership
  const fetchLicenses = async (dealership_id: number): Promise<number[]> => {
    try {
      const [licensesResponse, dealershipLicensesResponse] = await Promise.all([
        axiosInstance.get("/licenses"),
        axiosInstance.get(`/dealershipLicenses/${dealership_id}`),
      ]);

      setLicenses(licensesResponse.data);
      const licenseIds = dealershipLicensesResponse.data;
      setDealershipLicenses(licenseIds);

      return licenseIds; // Return the license IDs as required
    } catch (err) {
      console.error("Error fetching licenses:", err);
      return []; // Return an empty array in case of an error
    }
  };

  const toggleLicense = async (dealership_id: number, licenseId: number) => {
    try {
      if (dealershipLicenses.includes(licenseId)) {
        await axiosInstance.post(`/revokeDealershipLicense`, { dealership_id, licenseId });
        setDealershipLicenses(dealershipLicenses.filter((id) => id !== licenseId));
      } else {
        await axiosInstance.post(`/grantDealershipLicense`, { dealership_id, licenseId });
        setDealershipLicenses([...dealershipLicenses, licenseId]);
      }
    } catch (err) {
      console.error("Error toggling license:", err);
    }
  };

  return [licenses, fetchLicenses, toggleLicense] as const;
};

export default useFetchDealershipLicenses;
