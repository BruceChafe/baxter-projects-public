useEffect(() => {
  const fetchContactData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch contact details, including the `leads` array
      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

      if (contactError) throw contactError;

      // Fetch leads associated with the contact (optional, if you want to display lead details)
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("contact_id", id);

      if (leadsError) throw leadsError;

      // Combine contact data and leads
      setContactData({
        ...contactData,
        leads: leadsData || [],
      });

        ...contactData,
        leads: leadsData || [],
      });
    } catch (err: any) {
      console.error("Error fetching contact data:", err);
      setError(err.message || "Failed to load contact details.");
    } finally {
      setLoading(false);
    }
  };

  fetchContactData();
}, [id]);