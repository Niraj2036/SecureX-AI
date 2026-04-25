/** @type {import('next').NextConfig} */
const config = {
  images: {
    domains: [
      "picsum.photos",
      "peakstorage.blr1.digitaloceanspaces.com",
      "blr1.digitaloceanspaces.com",
    ],
  },
  i18n: {
    locales: ["en", "es", "fr", "de", "zh", "ar"],
    defaultLocale: "en",
  },
};

module.exports = config;
