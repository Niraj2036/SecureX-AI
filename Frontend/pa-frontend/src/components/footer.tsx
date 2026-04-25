import { Linkedin, Twitter } from "lucide-react";

import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <>
      {" "}
      <footer className="bg-[#042626] text-[#b2c5c5] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#084545] font-bold">SX</span>
                </div>
                <span className="text-xl font-bold text-white">SecureXAi</span>
              </div>
              <p className="mb-4">
                Streamline your OKR management for better team alignment and
                performance.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-[#e6ecec]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white hover:text-[#e6ecec]">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white">
                    Teams of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#396a6a] pt-8 text-center">
            <p>&copy; SecureXAi Corp 2024. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
