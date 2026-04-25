import React from "react";

const page = () => {
  return (
    <div className="bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-center text-gray-500 mb-12">
          Effective Date: <strong>April 26, 2025</strong>
        </p>

        <section className="space-y-8 text-base leading-relaxed">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of the
            SecureXAi platform (&quot;Service&quot;), provided by SecureXAi Inc.
            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing
            or using the Service, you agree to be bound by these Terms.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">1. Use of Service</h2>
            <p>
              You must be at least 16 years old and have the authority to bind
              your organization to these Terms. You agree to use the Service in
              compliance with all applicable laws and not for any unlawful or
              harmful purpose.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. Account Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You are also responsible for all activities
              that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. Subscription and Payment
            </h2>
            <p>
              Access to certain features requires a paid subscription. All fees
              are billed in advance and are non-refundable, unless otherwise
              stated.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Data and Privacy</h2>
            <p>
              Your use of the Service is subject to our{" "}
              <a href="/privacy-policy" className="text-blue-600 underline">
                Privacy Policy
              </a>
              , which describes how we collect and handle your data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. Intellectual Property
            </h2>
            <p>
              All intellectual property rights in the Service and its content
              are owned by or licensed to SecureXAi. You may not copy, modify,
              or distribute any part of the Service without our prior written
              consent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any
              time, with or without notice, for violation of these Terms or for
              any other reason at our sole discretion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              7. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of
              any kind. We do not guarantee that the Service will be error-free,
              secure, or uninterrupted.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for
              any indirect, incidental, special, or consequential damages
              arising out of or related to your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of [Your Jurisdiction], without regard to its conflict of law
              provisions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of
              material changes through the Service or via email. Continued use
              of the Service constitutes acceptance of the new Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <p className="mt-2">
              <strong>SecureXAi Inc.</strong>
              <br />
              Email:{" "}
              <a
                href="mailto:info@securexai.app"
                className="text-blue-600 underline"
              >
                info@securexai.app
              </a>
              <br />
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;

