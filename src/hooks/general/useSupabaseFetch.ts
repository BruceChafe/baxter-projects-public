import { useState, useEffect } from 'react';

interface UseSupabaseFetchOptions {
  tableName: string;
  query: () => Promise<{ data: any; error: any }>;
  dependencies?: any[];
  transform?: (data: any[]) => any[];
  enabled?: boolean;
}

export function useSupabaseFetch(options: UseSupabaseFetchOptions) {
  const { 
    tableName, 
    query, 
    dependencies = [], 
    transform,
    enabled = true
  } = options;
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    setLoading(true);
    try {
      const { data: result, error } = await query();
      
      if (error) throw error;
      
      const transformedData = transform ? transform(result || []) : result || [];
      setData(transformedData);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [...dependencies, enabled]);

  return { data, loading, error, refetch: fetchData };
}