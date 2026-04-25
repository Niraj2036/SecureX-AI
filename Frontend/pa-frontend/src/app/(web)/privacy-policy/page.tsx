import React from "react";

const page = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-6">Privacy Policy</h1>
        <p className="text-sm text-center text-gray-500 mb-12">
          Effective Date: <strong>April 26, 2025</strong>
        </p>

        <section className="space-y-8 text-base leading-relaxed">
          <p>
            <strong>SecureXAi</strong> (&quot;we&quot;, &quot;our&quot;, or
            &quot;us&quot;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our OKR and Performance Management
            SaaS platform (&quot;Service&quot;).
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address,
                organization name, encrypted password
              </li>
              <li>
                <strong>User Content & Usage Data:</strong> OKRs, feedback, team
                interactions, performance logs
              </li>
              <li>
                <strong>Technical Information:</strong> IP address, browser
                details, device identifiers
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> For analytics,
                personalization, and security
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Manage and maintain your account</li>
              <li>Operate and improve the Service</li>
              <li>Enable team collaboration and performance tracking</li>
              <li>Send service-related communications</li>
              <li>Support and analytics</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. Legal Basis for Processing (for EU Users)
            </h2>
            <p>
              We process your data under legal bases such as contract
              performance, legitimate interests, consent, and legal obligations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              4. Sharing of Your Information
            </h2>
            <p>
              We do <strong>not</strong> sell your data. We may share it with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Service providers (hosting, analytics, email, etc.)</li>
              <li>Legal authorities, if required by law</li>
              <li>Authorized team members based on role-based access</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Data Retention</h2>
            <p>
              We retain data as long as necessary to deliver the Service or
              comply with legal requirements. You can request deletion at any
              time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <p>
              You may have rights to access, update, delete, restrict, or export
              your data. Contact{" "}
              <a
                href="mailto:info@securexai.app"
                className="text-blue-600 underline"
              >
                info@securexai.app
              </a>{" "}
              to make a request.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
            <p>
              We use industry-standard security practices such as encryption,
              access control, and periodic audits to protect your data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              8. International Transfers
            </h2>
            <p>
              Your data may be processed outside your country. We ensure
              safeguards under applicable laws like the GDPR.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our Service is not intended for users under 16. We do not
              knowingly collect personal data from children.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this policy. Material updates will be communicated
              via email or in-app notifications.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">11. Contact Us</h2>
            <p>If you have questions or concerns, contact us at:</p>
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

