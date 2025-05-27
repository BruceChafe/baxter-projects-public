import React from "react";
import { Helmet } from "react-helmet";

interface PageHelmetProps {
  title: string;
  description?: string;
}

const PageHelmet: React.FC<PageHelmetProps> = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default PageHelmet;
