import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";

interface Department {
  id: number;
  name: string;
  job_titles: JobTitle[];
}

interface JobTitle {
  id: number;
  title: string;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
      .from("departments")
      .select(`
        *,
        job_titles:job_titles_department_id_fkey (
          id,
          title,
          department_id,
          is_universal,
          dealergroup_id
        )
      `);      

      if (error) throw error;

      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to fetch departments with job titles.");
    } finally {
      setLoading(false);
    }
  };

  return { departments, loading, error, refetchDepartments: fetchDepartments };
};
