/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "peakstorage.blr1.digitaloceanspaces.com" },
      { protocol: "https", hostname: "blr1.digitaloceanspaces.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = config;