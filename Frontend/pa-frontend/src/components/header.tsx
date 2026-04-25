import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import logo from "../../public/logo.svg";

const Header = () => {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* <div className="w-10 h-10 rounded-full bg-[#084545] flex items-center justify-center">
        <span className="text-white font-bold">PA</span>
      </div>
      <span className="text-xl font-bold text-[#084545]">SecureXAi</span> */}
            <Image
              src={logo} // Default logo when not open
              alt="Logo Icon"
              width={72}
              height={32}
              className="p-1 object-contain w-44 h-12"
            />
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link
                  href="#features"
                  className="text-black hover:text-[#084545] font-medium"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#testimonials"
                  className="text-black hover:text-[#084545] font-medium"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-black hover:text-[#084545] font-medium"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-black hover:text-[#084545] font-medium"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="hidden md:flex space-x-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-[#084545] text-[#084545] hover:bg-[#084545] hover:text-white"
              >
                Login
              </Button>
            </Link>
            <Button className="bg-[#084545] hover:bg-[#073f3f] text-white">
              Sign Up
            </Button>
          </div>
          <Button variant="ghost" className="md:hidden" aria-label="Menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>
        </div>
      </header>
    </>
  );
};

export default Header;
