import { Helmet } from "react-helmet-async";

const SITE_NAME = "Fitly.ng";
const SITE_URL = "https://fitly.ng";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const SEO = ({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  noIndex = false,
}) => {
  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : "Fitly.ng — Nigeria's Fashion Marketplace";

  const canonicalUrl = url
    ? `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`
    : SITE_URL;

  return (
    <Helmet>
      <title>{pageTitle}</title>

      <meta
        name="description"
        content={
          description ||
          "Shop fashion from trusted Nigerian vendors and discover clothing, shoes, accessories, and more on Fitly.ng."
        }
      />

      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />

      <meta
        property="og:description"
        content={
          description ||
          "Shop fashion from trusted Nigerian vendors on Fitly.ng."
        }
      />

      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />

      <meta
        name="twitter:description"
        content={
          description ||
          "Shop fashion from trusted Nigerian vendors on Fitly.ng."
        }
      />

      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
