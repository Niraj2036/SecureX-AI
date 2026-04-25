import { redirect } from "next/navigation";

export default function LandingPage() {
  // redirect("https://www.securexai.app/");
  redirect("/auth/login");
}

// import {
//   ArrowRight,
//   BarChart2,
//   CheckCircle,
//   Github,
//   Linkedin,
//   Mail,
//   MapPin,
//   Phone,
//   Target,
//   Twitter,
//   Users,
// } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { Input } from "@/components/ui/input";
// import Link from "next/link";
// import type React from "react";
// import { Textarea } from "@/components/ui/textarea";
// import analytics from "../../../public/landing-analytics.png";
// import hero from "../../../public/landing-hero.png";

// export default function LandingPage() {
//   return (
//     <>
//       <main className="flex-grow">
//         {/* Hero Section */}
//         <section className="relative bg-[#e6ecec] py-20 overflow-hidden">
//           <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10"></div>
//           <div className="container mx-auto px-4 relative">
//             <div className="flex flex-col md:flex-row items-center">
//               <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
//                 <Badge className="mb-4 bg-[#084545]/10 text-[#084545] hover:bg-[#084545]/20">
//                   OKR Management Platform
//                 </Badge>
//                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#084545] mb-6 leading-tight">
//                   Achieve Your Goals with SecureXAi
//                 </h1>
//                 <p className="text-xl text-[#396a6a] mb-8 max-w-lg">
//                   Streamline your Objectives and Key Results management for
//                   better team alignment and performance. Boost productivity and
//                   reach your targets faster.
//                 </p>
//                 <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
//                   <Link href={"/dashboard"}>
//                     <Button
//                       size="lg"
//                       className="bg-[#084545] hover:bg-[#073f3f] text-white"
//                     >
//                       Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
//                     </Button>
//                   </Link>
//                   <Button
//                     size="lg"
//                     variant="outline"
//                     className="border-[#084545] text-[#084545] hover:bg-[#084545] hover:text-white"
//                   >
//                     Book a Demo
//                   </Button>
//                 </div>
//                 <div className="mt-8 flex items-center justify-center md:justify-start">
//                   <div className="flex -space-x-2">
//                     {[1, 2, 3, 4].map((i) => (
//                       <div
//                         key={i}
//                         className="w-8 h-8 rounded-full bg-[#084545] border-2 border-white flex items-center justify-center"
//                       >
//                         <span className="text-white text-xs">U{i}</span>
//                       </div>
//                     ))}
//                   </div>
//                   <p className="ml-4 text-sm text-[#396a6a]">
//                     <span className="font-bold">500+</span> teams already using
//                     SecureXAi
//                   </p>
//                 </div>
//               </div>
//               <div className="md:w-1/2">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-[#084545]/10 rounded-lg blur-lg"></div>
//                   <div className="relative bg-white p-2 rounded-lg shadow-xl">
//                     <Image
//                       src={hero} // Default hero image
//                       alt="SecureXAi Dashboard"
//                       width={800}
//                       height={600}
//                       className=" rounded-md"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section id="features" className="py-20">
//           <div className="container mx-auto px-4">
//             <div className="text-center mb-16">
//               <Badge className="mb-4 bg-[#084545]/10 text-[#084545] hover:bg-[#084545]/20">
//                 Features
//               </Badge>
//               <h2 className="text-3xl md:text-4xl font-bold text-[#084545] mb-4">
//                 Everything You Need for OKR Success
//               </h2>
//               <p className="text-lg text-[#396a6a] max-w-2xl mx-auto">
//                 Our comprehensive platform provides all the tools you need to
//                 set, track, and achieve your objectives and key results.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <FeatureCard
//                 icon={<Target className="h-12 w-12 text-[#084545]" />}
//                 title="Goal Setting"
//                 description="Easily set and track objectives and key results for your entire organization with intuitive tools."
//               />
//               <FeatureCard
//                 icon={<BarChart2 className="h-12 w-12 text-[#084545]" />}
//                 title="Progress Tracking"
//                 description="Monitor progress in real-time with intuitive dashboards and comprehensive reports."
//               />
//               <FeatureCard
//                 icon={<Users className="h-12 w-12 text-[#084545]" />}
//                 title="Team Alignment"
//                 description="Ensure everyone is working towards common goals with transparent OKRs and clear visibility."
//               />
//             </div>

//             <div className="mt-16 bg-[#e6ecec] rounded-2xl overflow-hidden">
//               <div className="flex flex-col md:flex-row">
//                 <div className="md:w-1/2 p-8 md:p-12 flex items-center">
//                   <div>
//                     <h3 className="text-2xl md:text-3xl font-bold text-[#084545] mb-4">
//                       Advanced Analytics Dashboard
//                     </h3>
//                     <p className="text-[#396a6a] mb-6">
//                       Get deep insights into your team&apos;s performance with
//                       our advanced analytics dashboard. Track progress, identify
//                       bottlenecks, and make data-driven decisions.
//                     </p>
//                     <ul className="space-y-3">
//                       {[
//                         "Real-time progress tracking",
//                         "Custom reporting",
//                         "Team performance metrics",
//                         "Goal achievement forecasting",
//                       ].map((item, i) => (
//                         <li key={i} className="flex items-start">
//                           <CheckCircle className="h-5 w-5 text-[#084545] mr-2 flex-shrink-0 mt-0.5" />
//                           <span>{item}</span>
//                         </li>
//                       ))}
//                     </ul>
//                     <Button className="mt-8 bg-[#084545] hover:bg-[#073f3f] text-white">
//                       Learn More
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="md:w-1/2 bg-white p-4">
//                   <div className="rounded-lg overflow-hidden shadow-lg">
//                     <Image
//                       src={analytics}
//                       alt="Analytics Dashboard"
//                       width={600}
//                       height={700}
//                       className="w-full "
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Testimonials Section */}
//         <section id="testimonials" className="py-20 bg-[#f5f8f8]">
//           <div className="container mx-auto px-4">
//             <div className="text-center mb-16">
//               <Badge className="mb-4 bg-[#084545]/10 text-[#084545] hover:bg-[#084545]/20">
//                 Testimonials
//               </Badge>
//               <h2 className="text-3xl md:text-4xl font-bold text-[#084545] mb-4">
//                 What Our Customers Say
//               </h2>
//               <p className="text-lg text-[#396a6a] max-w-2xl mx-auto">
//                 Discover how SecureXAi has helped teams across various
//                 industries achieve their goals.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {testimonials.map((testimonial, index) => (
//                 <TestimonialCard key={index} {...testimonial} />
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Pricing Section */}
//         <section id="pricing" className="py-20">
//           <div className="container mx-auto px-4">
//             <div className="text-center mb-16">
//               <Badge className="mb-4 bg-[#084545]/10 text-[#084545] hover:bg-[#084545]/20">
//                 Pricing
//               </Badge>
//               <h2 className="text-3xl md:text-4xl font-bold text-[#084545] mb-4">
//                 Simple, Transparent Pricing
//               </h2>
//               <p className="text-lg text-[#396a6a] max-w-2xl mx-auto">
//                 Choose the plan that works best for your team. All plans include
//                 core features.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//               {pricingPlans.map((plan, index) => (
//                 <PricingCard key={index} {...plan} />
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="bg-[#084545] py-20">
//           <div className="container mx-auto px-4 text-center">
//             <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
//               Ready to Boost Your Team&apos;s Performance?
//             </h2>
//             <p className="text-xl text-[#b2c5c5] mb-8 max-w-2xl mx-auto">
//               Start using SecureXAi today and see the difference in your
//               organization&apos;s goal achievement. Join hundreds of successful
//               teams.
//             </p>
//             <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
//               <Link href={"/auth/login"}>
//                 <Button
//                   size="lg"
//                   className="bg-white text-[#084545] hover:bg-[#e6ecec]"
//                 >
//                   Get Started for Free
//                 </Button>
//               </Link>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="border-white text-black hover:bg-white/10"
//               >
//                 Schedule a Demo
//               </Button>
//             </div>
//           </div>
//         </section>

//         {/* Contact Section */}
//         <section id="contact" className="py-20">
//           <div className="container mx-auto px-4">
//             <div className="text-center mb-16">
//               <Badge className="mb-4 bg-[#084545]/10 text-[#084545] hover:bg-[#084545]/20">
//                 Contact Us
//               </Badge>
//               <h2 className="text-3xl md:text-4xl font-bold text-[#084545] mb-4">
//                 Get in Touch
//               </h2>
//               <p className="text-lg text-[#396a6a] max-w-2xl mx-auto">
//                 Have questions or need assistance? Our team is here to help you
//                 get started with SecureXAi.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
//               <div>
//                 <h3 className="text-2xl font-bold text-[#084545] mb-6">
//                   Contact Information
//                 </h3>
//                 <div className="space-y-6">
//                   <div className="flex items-start">
//                     <Mail className="h-6 w-6 text-[#084545] mr-4 mt-1" />
//                     <div>
//                       <h4 className="font-medium">Email</h4>
//                       <p className="text-[#396a6a]">support@securexai.com</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <Phone className="h-6 w-6 text-[#084545] mr-4 mt-1" />
//                     <div>
//                       <h4 className="font-medium">Phone</h4>
//                       <p className="text-[#396a6a]">+1 (555) 123-4567</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <MapPin className="h-6 w-6 text-[#084545] mr-4 mt-1" />
//                     <div>
//                       <h4 className="font-medium">Office</h4>
//                       <p className="text-[#396a6a]">
//                         123 OKR Street, San Francisco, CA 94103
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-8">
//                   <h3 className="text-2xl font-bold text-[#084545] mb-6">
//                     Follow Us
//                   </h3>
//                   <div className="flex space-x-4">
//                     <a
//                       href="#"
//                       className="p-2 bg-[#084545]/10 rounded-full hover:bg-[#084545]/20 transition-colors"
//                     >
//                       <Twitter className="h-5 w-5 text-[#084545]" />
//                     </a>
//                     <a
//                       href="#"
//                       className="p-2 bg-[#084545]/10 rounded-full hover:bg-[#084545]/20 transition-colors"
//                     >
//                       <Linkedin className="h-5 w-5 text-[#084545]" />
//                     </a>
//                     <a
//                       href="#"
//                       className="p-2 bg-[#084545]/10 rounded-full hover:bg-[#084545]/20 transition-colors"
//                     >
//                       <Github className="h-5 w-5 text-[#084545]" />
//                     </a>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white p-8 rounded-lg shadow-lg">
//                 <h3 className="text-2xl font-bold text-[#084545] mb-6">
//                   Send Us a Message
//                 </h3>
//                 <form className="space-y-6">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label htmlFor="name" className="text-sm font-medium">
//                         Name
//                       </label>
//                       <Input id="name" placeholder="Your name" />
//                     </div>
//                     <div className="space-y-2">
//                       <label htmlFor="email" className="text-sm font-medium">
//                         Email
//                       </label>
//                       <Input id="email" type="email" placeholder="Your email" />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <label htmlFor="subject" className="text-sm font-medium">
//                       Subject
//                     </label>
//                     <Input id="subject" placeholder="How can we help?" />
//                   </div>
//                   <div className="space-y-2">
//                     <label htmlFor="message" className="text-sm font-medium">
//                       Message
//                     </label>
//                     <Textarea
//                       id="message"
//                       placeholder="Your message"
//                       rows={5}
//                     />
//                   </div>
//                   <Button className="w-full bg-[#084545] hover:bg-[#073f3f] text-white">
//                     Send Message
//                   </Button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }

// function FeatureCard({
//   icon,
//   title,
//   description,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
// }) {
//   return (
//     <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
//       <CardHeader>
//         <div className=" mb-4 bg-[#084545]/10 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
//           {icon}
//         </div>
//         <CardTitle className="text-xl font-semibold text-[#084545] text-center">
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-[#396a6a] text-center">{description}</p>
//       </CardContent>
//     </Card>
//   );
// }

// function TestimonialCard({
//   quote,
//   author,
//   role,
//   company,
// }: {
//   quote: string;
//   author: string;
//   role: string;
//   company: string;
// }) {
//   return (
//     <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
//       <CardContent className="pt-6">
//         <div className="mb-4">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <span key={star} className="text-yellow-400">
//               â˜…
//             </span>
//           ))}
//         </div>
//         <p className="text-[#396a6a] mb-6 italic">&quot;{quote}&quot;</p>
//         <div className="flex items-center">
//           <div className="w-10 h-10 rounded-full bg-[#084545]/20 flex items-center justify-center mr-3">
//             <span className="text-[#084545] font-bold">{author.charAt(0)}</span>
//           </div>
//           <div>
//             <p className="font-semibold text-[#084545]">{author}</p>
//             <p className="text-sm text-[#396a6a]">
//               {role}, {company}
//             </p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function PricingCard({
//   name,
//   price,
//   description,
//   features,
//   isPopular,
// }: {
//   name: string;
//   price: string;
//   description: string;
//   features: string[];
//   isPopular?: boolean;
// }) {
//   return (
//     <Card
//       className={`bg-white border-none shadow-lg ${
//         isPopular ? "ring-2 ring-[#084545] relative" : ""
//       }`}
//     >
//       {isPopular && (
//         <div className="absolute top-0 right-0 -mt-2 -mr-2">
//           <Badge className="bg-[#084545]">Most Popular</Badge>
//         </div>
//       )}
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold text-[#084545]">
//           {name}
//         </CardTitle>
//         <CardDescription>{description}</CardDescription>
//         <div className="mt-4">
//           <span className="text-3xl font-bold text-[#084545]">{price}</span>
//           {price !== "Custom" && <span className="text-[#396a6a]">/month</span>}
//         </div>
//       </CardHeader>
//       <CardContent>
//         <ul className="space-y-3">
//           {features.map((feature, i) => (
//             <li key={i} className="flex items-start">
//               <CheckCircle className="h-5 w-5 text-[#084545] mr-2 flex-shrink-0 mt-0.5" />
//               <span className="text-[#396a6a]">{feature}</span>
//             </li>
//           ))}
//         </ul>
//       </CardContent>
//       <CardFooter>
//         <Button
//           className={`w-full ${
//             isPopular
//               ? "bg-[#084545] hover:bg-[#073f3f] text-white"
//               : "bg-white border border-[#084545] text-[#084545] hover:bg-[#084545] hover:text-white"
//           }`}
//         >
//           {price === "Free" ? "Get Started" : "Contact Sales"}
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }

// // Data
// const testimonials = [
//   {
//     quote:
//       "SecureXAi has transformed how our team sets and achieves goals. The visibility and alignment it provides is incredible.",
//     author: "Sarah Johnson",
//     role: "VP of Operations",
//     company: "TechCorp",
//   },
//   {
//     quote:
//       "We've increased our goal achievement rate by 40% since implementing SecureXAi. The analytics are game-changing.",
//     author: "Michael Chen",
//     role: "Team Lead",
//     company: "InnovateCo",
//   },
//   {
//     quote:
//       "The most user-friendly OKR platform we've tried. Our entire organization adopted it within weeks.",
//     author: "Jessica Williams",
//     role: "Director of HR",
//     company: "GrowthInc",
//   },
// ];

// const pricingPlans = [
//   {
//     name: "Starter",
//     price: "Free",
//     description: "Perfect for small teams just getting started with OKRs",
//     features: [
//       "Up to 5 team members",
//       "Basic goal tracking",
//       "Weekly email reports",
//       "Core integrations",
//       "Email support",
//     ],
//   },
//   {
//     name: "Professional",
//     price: "$12",
//     description: "Ideal for growing teams that need more features",
//     features: [
//       "Up to 20 team members",
//       "Advanced analytics",
//       "Custom dashboards",
//       "All integrations",
//       "Priority support",
//       "Team alignment tools",
//     ],
//     isPopular: true,
//   },
//   {
//     name: "Enterprise",
//     price: "Custom",
//     description: "For large organizations with complex needs",
//     features: [
//       "Unlimited team members",
//       "Advanced security",
//       "Dedicated account manager",
//       "Custom integrations",
//       "24/7 premium support",
//       "Advanced reporting",
//     ],
//   },
// ];

