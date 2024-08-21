export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 text-primary">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-400">Last updated: 2024-08-21</p>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          At Giant Auto Import, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our website and services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Personal information (e.g., name, email address, phone number)</li>
          <li>Payment information</li>
          <li>Vehicle information</li>
          <li>Usage data and analytics</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
        <p>We use the collected information for various purposes, including:</p>
        <ul>
          <li>Providing and improving our services</li>
          <li>Processing transactions</li>
          <li>Communicating with you</li>
          <li>Analyzing usage patterns</li>
          <li>Complying with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
        <p>
          We may use third-party services that collect, monitor, and analyze data. These third parties have their own privacy policies addressing how they use such information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Request deletion of your data</li>
          <li>Object to the processing of your data</li>
          <li>Request a copy of your data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          Email: <a href="mailto:giant.autoimporti@gmail.com" className="text-blue-600 dark:text-blue-400">giant.autoimporti@gmail.com</a><br />
          Phone: <a href="tel:+995555550553" className="text-blue-600 dark:text-blue-400">+995 555 550 553</a>
        </p>
      </div>
    </div>
  );
}