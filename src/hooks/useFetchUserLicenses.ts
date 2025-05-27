import { useState, useEffect } from "react";
import axiosInstance from "../axios";

const useFetchUserLicenses = (userId: number, dealership_id: number) => {
  const [userLicenses, setUserLicenses] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !dealership_id) return;

    const fetchUserLicenses = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/userLicenses/${userId}`);
        const licenses = response.data;
        setUserLicenses(licenses);
      } catch (err) {
        setError("Failed to load user licenses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLicenses();
  }, [userId, dealership_id]);

  const toggleLicense = (licenseId: number) => {
    setUserLicenses((prevLicenses) =>
      prevLicenses.includes(licenseId)
        ? prevLicenses.filter((id) => id !== licenseId)
        : [...prevLicenses, licenseId]
    );
  };

  return { userLicenses, toggleLicense, isLoading, error };
};

export default useFetchUserLicenses;
