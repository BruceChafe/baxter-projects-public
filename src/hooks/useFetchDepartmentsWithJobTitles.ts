import { useState, useEffect } from "react";
import axiosInstance from "../axios";

export const useDepartmentsWithJobTitles = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDepartmentsWithJobTitles = async () => {
    try {
      const response = await axiosInstance.get("/departmentsWithJobTitles");
      const data = Array.isArray(response.data) ? response.data : [];
      setDepartments(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch departments with job titles.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsWithJobTitles();
  }, []);

  return { departments, loading, error };
};

