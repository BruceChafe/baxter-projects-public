import { useCallback } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import { uploadLicenseImage } from "../../components/upshift/licenseScanner/utils/supabaseUpload";
import { scanPdf417FromBase64 } from "../../components/upshift/licenseScanner/utils/barcodeScanner";

interface ExtractedData {
  FIRST_NAME: string;
  LAST_NAME: string;
  MIDDLE_NAME?: string;
  SUFFIX?: string;
  DATE_OF_BIRTH?: string;
  EXPIRATION_DATE?: string;
  DOCUMENT_NUMBER: string;
  CLASS?: string;
  RESTRICTIONS?: string;
  ENDORSEMENTS?: string;
  ADDRESS_LINE1?: string;
  ADDRESS_LINE2?: string;
  CITY?: string;
  STATE?: string;
  ZIP_CODE_IN_ADDRESS?: string;
  COUNTRY?: string;
  GENDER?: string;
  EYE_COLOR?: string;
  HEIGHT?: string;
  WEIGHT?: string;
  imageUrl: {
    front: string;
    rear: string;
  };
}

interface UseLicenseScannerProps {
  frontImage: File | null;
  rearImage: File | null;
  userId: number;
  dealership_id: string | null;
  dealergroup_id: string | null;
  contact_id: string | null;
  selected_dealergroup_id: string | null;
  setExtractedData: React.Dispatch<React.SetStateAction<ExtractedData>>;
  checkdate_of_birth: () => void;
  checkExpirationDate: () => void;
  setBannedMessage: (msg: string) => void;
  setStep: (step: number) => void;
  setIsLoading: (loading: boolean) => void;
  showSnackbar: (message: string, type: "success" | "error") => void;
}

const useLicenseScanner = ({
  frontImage,
  rearImage,
  userId,
  dealership_id,
  dealergroup_id,
  contact_id,
  selected_dealergroup_id,
  setExtractedData,
  checkdate_of_birth,
  checkExpirationDate,
  setBannedMessage,
  setStep,
  setIsLoading,
  showSnackbar,
}: UseLicenseScannerProps) => {
  const handleAnalyzeLicense = useCallback(async () => {
    if (!frontImage || !rearImage) {
      showSnackbar("Both front and rear license images are required.", "error");
      return;
    }
  
    if (!contact_id) {
      showSnackbar("Contact ID is required for license processing.", "error");
      return;
    }
  
    setIsLoading(true);

    try {
      // Upload both images to Supabase with proper error handling
      let frontUrl: string | null = null;
      let rearUrl: string | null = null;
      
      try {
        // First try front image upload
        frontUrl = await uploadLicenseImage(frontImage, contact_id, "front");
        
        // Then try rear image upload
        rearUrl = await uploadLicenseImage(rearImage, contact_id, "rear");
      } catch (uploadError: any) {
        console.error("Image upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload license images.");
      }
  
      if (!frontUrl || !rearUrl) {
        throw new Error("Failed to get URLs for uploaded license images.");
      }
  
      // Continue with the rest of your function...
      // Run QuaggaJS barcode scan on rear
      const rearBase64 = await fileToBase64(rearImage);
      let barcodeData: string | null = null;
      try {
        barcodeData = await scanPdf417FromBase64(rearBase64);
        if (!barcodeData) {
          showSnackbar("Notice: No barcode found in rear license image. Continuing without it.", "error");
        }
      } catch (e) {
        console.warn("Barcode scan failed but continuing anyway.");
        showSnackbar("Notice: Failed to scan barcode from rear image. Continuing without it.", "error");
      }
      

      // Call Edge Function to analyze the front image
      const response = await supabase.functions.invoke("analyze-license", {
        body: {
          frontImageUrl: frontUrl,
          contact_id,
          barcodeData,
        },
      });
            
      let extractedData;
      try {
        const parsed = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        extractedData = parsed?.extractedData;
      } catch (parseError) {
        console.error("❌ Failed to parse analyze-license response:", parseError);
        showSnackbar("Unexpected response from license analyzer.", "error");
        return;
      }
      
      if (!extractedData) {
        console.error("❌ No extractedData in response:", response);
        showSnackbar("License analysis failed.", "error");
        return;
      }

      const enrichedData: ExtractedData = {
        ...extractedData,
        imageUrl: {
          front: frontUrl,
          rear: rearUrl,
        },
      };
      

      setExtractedData(enrichedData);
      checkdate_of_birth();
      checkExpirationDate();

      // Optional: check ban list via another function
      const { data: banData } = await supabase.functions.invoke("check-visitor-ban", {
        body: {
          licenseNumber: enrichedData.DOCUMENT_NUMBER,
          dealergroup_id: selected_dealergroup_id,
        },
      });

      if (banData?.is_banned) {
        setBannedMessage("Warning: This visitor is banned.");
      } else {
        setBannedMessage("All Clear: No matches found.");
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      showSnackbar("License analysis failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [
    frontImage,
    rearImage,
    contact_id,
    selected_dealergroup_id,
    setIsLoading,
    showSnackbar,
    setExtractedData,
    checkdate_of_birth,
    checkExpirationDate,
    setBannedMessage,
    setStep,
  ]);

  const handleSubmitLicense = useCallback(
    async (extractedData: ExtractedData) => {
      const missingFields: string[] = [];
  
      // ✅ Check updated keys
      if (!dealership_id) missingFields.push("Dealership");
      if (!dealergroup_id) missingFields.push("Dealer Group");
      if (!extractedData.ADDRESS) missingFields.push("Address");
      if (!extractedData.CITY_IN_ADDRESS) missingFields.push("City");
      if (!extractedData.STATE_IN_ADDRESS) missingFields.push("State");     
      if (!extractedData.DATE_OF_BIRTH) missingFields.push("Date of Birth");
      if (!extractedData.DOCUMENT_NUMBER) missingFields.push("License Number");
      if (!extractedData.EXPIRATION_DATE) missingFields.push("Expiration Date");
      if (!extractedData.FIRST_NAME) missingFields.push("First Name");
      if (!extractedData.LAST_NAME) missingFields.push("Last Name");
  
      if (missingFields.length > 0) {
        showSnackbar(
          `Please fill in the following fields: ${missingFields.join(", ")}.`,
          "error"
        );
        return;
      }
  
      setIsLoading(true);
  
      try {
        const payload = {
          userId,
          contact_id,
          dealership_id,
          dealergroup_id,
          ...extractedData,
        };
  
        const { error } = await supabase.functions.invoke("submit-license", {
          body: payload,
        });
  
        if (error) throw error;
  
        showSnackbar("License submitted successfully.", "success");
        setStep(1);
      } catch (error) {
        console.error(error);
        showSnackbar("Failed to submit license. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      dealership_id,
      dealergroup_id,
      contact_id,
      userId,
      setIsLoading,
      showSnackbar,
      setStep,
    ]
  );
  

  return { handleAnalyzeLicense, handleSubmitLicense };
};

export default useLicenseScanner;

// Helpers
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
