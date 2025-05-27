import { useEffect } from "react";
import { supabase } from "../../../../supabase/supabaseClient";

const ConfirmPage = () => {
  useEffect(() => {
    const run = async () => {
      await supabase.auth.getSession(); // forces cookie to be set
      window.close(); // closes the tab or popup
    };
    run();
  }, []);

  return null; // no UI needed
};

export default ConfirmPage;
