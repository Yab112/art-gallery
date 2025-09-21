import { siteConfig } from "@/config/site";
import type React from "react";
import { Helmet } from "react-helmet-async";

const DefaultMetadata: React.FC = () => {
  return (
    <Helmet>
      <title>{siteConfig?.name}</title>
      <meta name="description" content={siteConfig?.description} />
      <meta name="keywords" content={siteConfig?.keyWords?.join(",")} />
      <meta property="og:title" content={siteConfig?.name} />
      <meta property="og:description" content={siteConfig?.description} />
      <meta
        property="og:image"
        content="https://example.com/default-image.jpg"
      />
    </Helmet>
  );
};

export default DefaultMetadata;
