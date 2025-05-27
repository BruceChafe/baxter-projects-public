import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppBarComponent from "./AppBarComponent";
import FooterComponent from "../sharedComponents/FooterComponent";

interface LayoutComponentProps {
  children: React.ReactNode;
  forceDarkText?: boolean;
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LayoutComponent: React.FC<LayoutComponentProps> = ({ children, forceDarkText = false }) => {
  return (
    <>
      <ScrollToTop />
      <AppBarComponent forceDarkText={forceDarkText} />
      {children}
      <FooterComponent />
    </>
  );
};

export default LayoutComponent;
