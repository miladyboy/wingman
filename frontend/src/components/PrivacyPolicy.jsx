import React from "react";

/**
 * Privacy Policy for Harem
 *
 * This component renders the full privacy policy as provided by legal counsel.
 * All sections, tables, and details are updated to match the latest requirements.
 *
 * For maintainers: Each section is clearly separated and commented for easy updates.
 */
const PrivacyPolicy = () => (
  <main className="container mx-auto max-w-3xl py-12 px-4 font-sans text-gray-800">
    {/* Header */}
    <h1 className="text-4xl font-bold mb-6 text-gray-900">Harem Privacy Policy</h1>
    <p className="mb-2 text-sm text-gray-600"><strong>Effective Date:</strong> <em>18 May 2025</em></p>
    <p className="mb-6 text-sm text-gray-600"><em>Last Updated: 19 May 2025</em></p>

    <hr className="my-8 border-gray-300" />

    {/* 1. Who We Are */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">1 Who We Are</h2>
      <p className="mb-4"><strong>Capybara Studios Ltd.</strong> (trading as <strong>Capybara Inc.</strong>, "<em>we</em>", "<em>our</em>", or "<em>us</em>") operates the Harem web application (<code className="bg-gray-100 px-1 rounded">getharem.com</code>, the <strong>"Service"</strong>). Our registered office is:</p>
      <blockquote className="mb-4 pl-4 italic border-l-2 border-gray-300 text-gray-600">
        <p>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</p>
        <p>Email: <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a></p>
        <p>Data‑Protection Officer (DPO): <em>N/A</em></p>
      </blockquote>
      <p className="mb-2">We are the <strong>controller</strong> of your personal data except where this Policy states otherwise. We do not currently appoint a Data-Protection Officer.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 2. Scope */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Scope</h2>
      <p className="mb-4">This Policy explains how we collect, use, store, share and protect your personal data when you:</p>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li>visit our website or apps,</li>
        <li>create an account,</li>
        <li>upload content such as images, chat logs or notes to a private "Thread," or</li>
        <li>otherwise interact with us.</li>
      </ul>
      <p>It also describes your privacy rights and how to exercise them. Region-specific disclosures are provided in section 13.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 3. What Data We Collect and Why */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. What Data We Collect and Why</h2>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Category</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Examples</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Purpose</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Retention*</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Account Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Email address, hashed password or passkey public key, billing plan, IP address, locale</td>
              <td className="p-3 border-b border-gray-300 align-top">Create and manage your account, authentication, billing, security</td>
              <td className="p-3 border-b border-gray-300 align-top">Until account deletion + 30 days for backups</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Thread Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Photos, avatars, full chat history, notes, tags and timeline events you create about a person you are dating ("Threads")</td>
              <td className="p-3 border-b border-gray-300 align-top">Provide AI suggestions and reminders, maintain your private records</td>
              <td className="p-3 border-b border-gray-300 align-top">Until you delete the Thread or close your account</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Usage Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Log files, device/browser type, pages viewed, feature usage, clickstream data (via PostHog EU), cookie consent status</td>
              <td className="p-3 border-b border-gray-300 align-top">Improve and secure the Service, product analytics</td>
              <td className="p-3 border-b border-gray-300 align-top">12 months</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Communication Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Emails, support tickets, surveys</td>
              <td className="p-3 border-b border-gray-300 align-top">Respond to you, improve Service</td>
              <td className="p-3 border-b border-gray-300 align-top">24 months</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Payment Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Last 4 card digits, expiry, country (handled by Stripe)</td>
              <td className="p-3 border-b border-gray-300 align-top">Process subscriptions</td>
              <td className="p-3 border-b border-gray-300 align-top">Stored by Stripe under its own policy</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mb-4"><em>*Encrypted backups are pruned within 30 days.</em></p>
      <blockquote className="mb-4 p-3 border-l-4 border-red-500 bg-red-50 text-red-700 text-sm">
        <p>We never require personal data about the people you interact with beyond what you choose to upload. Please do not upload illegal, harmful or explicit content.</p>
      </blockquote>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 4. How We Use Your Data */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. How We Use Your Data</h2>
      <p className="mb-4">We process personal data to:</p>
      <ol className="list-decimal list-inside mb-4 pl-4 space-y-1">
        <li>Deliver the Service — operate Threads, generate AI advice, send reminders.</li>
        <li>Secure the Service — prevent fraud, abuse or unauthorised access.</li>
        <li>Improve and develop — analyse aggregated usage in PostHog EU, prototype internal features. We do not train proprietary models on your content at this time.</li>
        <li>Comply with law — bookkeeping, tax, responding to lawful requests.</li>
        <li>Communicate with you — transactional emails, product updates and support.</li>
      </ol>
      <p>Our legal bases under the GDPR are performance of contract (Art 6 (1)(b)), legitimate interests (Art 6 (1)(f)), consent where required (Art 6 (1)(a)) and compliance with legal obligations (Art 6 (1)(c)). A legitimate-interest balancing test for analytics is available on request.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 5. AI Processing */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. AI Processing</h2>
      <p>Content you send in a Thread is forwarded to third-party large-language-model providers, currently OpenAI Inc. and Anthropic PBC, solely to generate dating advice. We pseudonymise data by stripping direct identifiers before transfer. These providers act as processors under contractual terms that prohibit training or secondary use. <span className="italic">[OpenAI's and Anthropic's own retention schedules apply; please see their policies.]</span></p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 6. Cookies and Similar Technologies */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Cookies and Similar Technologies</h2>
      <p>We use strictly necessary cookies for authentication and security. Analytics cookies and local-storage keys placed by PostHog EU are loaded only after you provide consent through our on-site cookie banner, which records and stores your choice.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 7. How We Share Data */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. How We Share Data</h2>
      <p className="mb-4">We do not sell personal data. Disclosures are limited to:</p>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Recipient</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Role</th>
              <th className="p-3 border-b border-gray-300 text-left font-semibold text-gray-700">Safeguards</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Supabase Inc.</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">EU cloud hosting and Postgres database</td>
              <td className="p-3 border-b border-gray-300 align-top">SOC 2 Type II, RLS enabled, SCCs</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>OpenAI Inc. / Anthropic PBC</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">LLM API processing</td>
              <td className="p-3 border-b border-gray-300 align-top">SCCs + processor terms, no training</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Stripe Inc.</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Payment processor (independent controller)</td>
              <td className="p-3 border-b border-gray-300 align-top">PCI-DSS Level 1</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>PostHog Inc.</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">EU-hosted analytics</td>
              <td className="p-3 border-b border-gray-300 align-top">SCCs + DPA</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top">Authorities or legal counsel</td>
              <td className="p-3 border-b border-gray-300 align-top">Compliance with valid requests</td>
              <td className="p-3 border-b border-gray-300 align-top">Reviewed case-by-case</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>We may publish aggregate, de-identified statistics that can no longer identify any individual.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 8. International Transfers */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. International Transfers</h2>
      <p>Personal data may be processed outside your country. When we transfer data from the UK or EEA to the United States we rely on Standard Contractual Clauses and, where applicable, the EU-US Data Privacy Framework. We continually monitor legal developments and will update safeguards as required.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 9. Security Measures */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Security Measures</h2>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li>TLS 1.3 in transit, AES-256 at rest (including backups)</li>
        <li>Row-Level Security on every table, user-scoped tokens</li>
        <li>Zero-trust network segmentation and least-privilege IAM</li>
        <li>24 × 7 monitoring and an incident-response plan that includes reporting any breach to regulators within 72 hours</li>
      </ul>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 10. Data Retention and Deletion */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Data Retention and Deletion</h2>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li><strong>Threads and uploads</strong> — deleted immediately when you delete them or close your account.</li>
        <li><strong>Account</strong> — live records deleted within 7 days after closure, backups within 30 days.</li>
        <li><strong>Legal and financial records</strong> — retained up to 7 years where required.</li>
      </ul>
      <p>Submit deletion or export requests to <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a>.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 11. Your Rights */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Your Rights</h2>
      <p className="mb-4">Depending on your jurisdiction you may have rights to access, rectify, erase, port, restrict, object or withdraw consent. Contact <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a> and we will respond within 30 days. Data exports are currently provided by email in JSON format.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 12. Automated Decision-Making */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Automated Decision-Making</h2>
      <p>AI recommendations are supportive only. No decision producing legal or similarly significant effects is made solely by automated means. You may object and request human review at any time.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 13. Region-Specific Disclosures */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">13. Region-Specific Disclosures</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">EEA &amp; United Kingdom</h3>
        <p className="mb-2">Our lead supervisory authority in the UK is the Information Commissioner's Office. We will appoint an EU Article 27 representative if we begin actively targeting EEA users while lacking an EU establishment.</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">California (CCPA / CPRA)</h3>
        <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
          <li>We act as a "Service Provider." We do not sell or share personal information for cross-context behavioural advertising.</li>
          <li>A "Do Not Sell or Share My Personal Information" link is available in the website footer. You may exercise rights to know, delete, correct or opt out via that link or by emailing us.</li>
          <li>Categories collected correspond to section 3 above.</li>
        </ul>
      </div>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 14. Children */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">14. Children</h2>
      <p>The Service is not intended for anyone under 18. Age is self-declared during sign-up. If we learn that a minor has provided data, we will delete it promptly.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 15. Changes to This Policy */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">15. Changes to This Policy</h2>
      <p>We may update this Policy. Material changes will be announced by email or in-app notice at least 15 days before they take effect. The latest version is always available at <strong className="text-gray-900">getharem.com/privacy</strong> and replaces older versions.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    {/* 16. Contact */}
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">16. Contact</h2>
      <p className="mb-4">Questions or complaints? Email <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a> or write to:</p>
      <blockquote className="pl-4 italic border-l-2 border-gray-300 text-gray-600">
        <p>Capybara Studios Ltd.</p>
        <p>71-75 Shelton Street, Covent Garden, London WC2H 9JQ</p>
        <p>Attn: Privacy Team</p>
      </blockquote>
    </section>

    <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
      <p>© 2025 Capybara Studios Ltd. All rights reserved.</p>
    </footer>
  </main>
);

export default PrivacyPolicy;
