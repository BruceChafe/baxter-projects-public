import { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  primary_email?: string;
  mobile_phone?: string;
  home_phone?: string;
  work_phone?: string;
  street_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  // Add any other fields you expect to have in your contact documents
}

interface FetchContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

const useFetchContacts = () => {
  const [data, setData] = useState<FetchContactsState>({
    contacts: [],
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const q = query(collection(db, "contacts"));
      const querySnapshot = await getDocs(q);
      const contactsArray: Contact[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Contact
      }));

      setData({
        contacts: contactsArray,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      setData({
        contacts: [],
        loading: false,
        error: error.message,
      });
    }
  }, []);

  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  return { data, reload: fetchData };
};

export { useFetchContacts };