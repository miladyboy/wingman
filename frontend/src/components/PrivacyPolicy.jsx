import React from "react";

/**
 * Privacy Policy for Harem
 *
 * This component renders the full privacy policy with improved styling for readability.
 */
const PrivacyPolicy = () => (
  <main className="container mx-auto max-w-3xl py-12 px-4 font-sans text-gray-800">
    <h1 className="text-4xl font-bold mb-6 text-gray-900">Harem Privacy Policy</h1>
    <p className="mb-2 text-sm text-gray-600"><strong>Effective Date:</strong> <em>18 May 2025</em></p>
    <p className="mb-6 text-sm text-gray-600"><em>Last updated: 18 May 2025</em></p>
    
    <blockquote className="mb-8 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
      <p className="font-semibold">Beta summary:</p>
      <p>Harem is launching in beta. We're UK‑based and store your data in the EU (Supabase). We don't sell or share it, and you can delete everything at any time by emailing <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a>. Full policy below.</p>
    </blockquote>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">1 Who We Are</h2>
      <p className="mb-4"><strong>Capybara Studios Ltd.</strong> (trading as <strong>Capybara Inc.</strong>, "<em>we</em>", "<em>our</em>", or "<em>us</em>") operates the Harem web application (<code className="bg-gray-100 px-1 rounded">getharem.com</code>, the <strong>"Service"</strong>). Our registered office is:</p>
      <blockquote className="mb-4 pl-4 italic border-l-2 border-gray-300 text-gray-600">
        <p>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</p>
        <p>Email: <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a></p>
        <p>Data‑Protection Officer (DPO): <em>N/A</em></p>
      </blockquote>
      <p>We are the <strong>controller</strong> of your personal data except where stated otherwise in this Policy.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">2 Scope of This Policy</h2>
      <p className="mb-4">This Policy explains how we collect, use, store, share and protect your personal data when you:</p>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li>visit our websites or apps;</li>
        <li>create an account;</li>
        <li>upload content (e.g. images, chat logs, notes) to a <strong>Girl Thread</strong>; or</li>
        <li>otherwise interact with us.</li>
      </ul>
      <p>It also describes your privacy rights and how to exercise them.<br />
        <em className="text-sm text-gray-600">Residents of the European Economic Area ("EEA"), United Kingdom and California should also review section 12 for region‑specific disclosures.</em>
      </p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">3 What Data We Collect</h2>
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
              <td className="p-3 border-b border-gray-300 align-top">Email address, password <strong>or</strong> passkey public key, billing plan, language, IP address</td>
              <td className="p-3 border-b border-gray-300 align-top">Create &amp; manage your account, authentication, billing, security</td>
              <td className="p-3 border-b border-gray-300 align-top">Until account deletion + 30 days backups</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Relationship Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Photos, avatars, chat history, notes, tags, timeline events relating to a person you are dating ("<strong>Girl Threads</strong>")</td>
              <td className="p-3 border-b border-gray-300 align-top">Provide AI advice &amp; reminders, maintain your private records</td>
              <td className="p-3 border-b border-gray-300 align-top">Until you delete the thread or close your account</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Usage Data (Analytics)</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Log files, device/browser type, pages viewed, feature usage, clickstream data (collected via PostHog)</td>
              <td className="p-3 border-b border-gray-300 align-top">Improve Service, product analytics (via PostHog), detect abuse</td>
              <td className="p-3 border-b border-gray-300 align-top">12 months (PostHog data subject to their retention)</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Communication Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Support tickets, emails, surveys</td>
              <td className="p-3 border-b border-gray-300 align-top">Respond to you, improve Service</td>
              <td className="p-3 border-b border-gray-300 align-top">24 months</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Payment Data</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Last 4 digits of card, expiry, country (handled by Stripe)</td>
              <td className="p-3 border-b border-gray-300 align-top">Process subscriptions</td>
              <td className="p-3 border-b border-gray-300 align-top">Stored by Stripe under its own policy</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mb-4"><em>*Backups are encrypted and regularly pruned; maximum 30 days retention.</em></p>
      <blockquote className="mb-4 p-3 border-l-4 border-red-500 bg-red-50 text-red-700 text-sm">
        <p className="font-semibold">Sensitive data:</p> 
        <p>Harem is designed to <strong>never require</strong> personal data about the women you interact with beyond what <strong>you choose</strong> to upload. Do <strong>not</strong> upload any illegal, harmful, or explicit content.</p>
      </blockquote>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">4 How &amp; Why We Use Your Data</h2>
      <p className="mb-4">We process personal data to:</p>
      <ol className="list-decimal list-inside mb-4 pl-4 space-y-1">
        <li><strong>Provide the Service</strong> – operate Girl Threads, generate AI suggestions, send reminders.</li>
        <li><strong>Secure the Service</strong> – prevent fraud, abuse, unauthorised access.</li>
        <li><strong>Improve &amp; develop</strong> – train/validate non‑identifiable models, conduct product analytics (using PostHog) to understand usage patterns and enhance user experience.</li>
        <li><strong>Comply with law</strong> – tax, accounting, legal requests.</li>
        <li><strong>Communicate with you</strong> – transactional emails, product updates, support.</li>
      </ol>
      <p>Our <strong>legal bases</strong> under the GDPR are: performance of a contract (Art. 6(1)(b)), legitimate interests (Art. 6(1)(f)), consent where required (Art. 6(1)(a)), and compliance with legal obligations (Art. 6(1)(c)).</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">5 Automated AI Processing</h2>
      <p>Girl Thread content you upload is sent to third‑party large‑language‑model (LLM) providers (e.g. OpenAI, Anthropic) to generate strategic dating advice.<br />
        We <strong>pseudonymise</strong> your data by removing direct identifiers before sending. Providers act as <strong>processors</strong> under contractual terms that prohibit them from training on or otherwise using your content beyond providing the Service.
      </p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">6 Cookies &amp; Similar Tech</h2>
      <p>We use <strong>strictly necessary cookies</strong> for authentication and security. For product analytics and improvement, we use <a href="https://posthog.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PostHog</a>, which may utilize cookies or similar technologies (e.g., local storage) to collect usage data; this is done only with your consent in the EEA/UK/Brazil.<br />
        See our separate <a href="/cookie-notice" className="text-blue-600 hover:underline">Cookie Notice</a> for details on managing your preferences.
      </p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">7 How We Share Data</h2>
      <p className="mb-4">We do <strong>not sell</strong> personal data. We disclose it only to:</p>
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
              <td className="p-3 border-b border-gray-300 align-top"><strong>Supabase, Inc.</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Cloud hosting &amp; Postgres database</td>
              <td className="p-3 border-b border-gray-300 align-top">SOC 2 Type II; DPA &amp; SCCs; EU region</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>OpenAI, Inc. / Anthropic PBC</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">LLM API processing</td>
              <td className="p-3 border-b border-gray-300 align-top">DPA &amp; SCCs; processing limited to your prompts</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>Stripe, Inc.</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Payment processor</td>
              <td className="p-3 border-b border-gray-300 align-top">PCI‑DSS Level 1; separate controller</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top"><strong>PostHog, Inc.</strong></td>
              <td className="p-3 border-b border-gray-300 align-top">Product analytics &amp; improvement platform</td>
              <td className="p-3 border-b border-gray-300 align-top">DPA &amp; SCCs; Option for EU data hosting</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-300 align-top">Authorities or legal counsel</td>
              <td className="p-3 border-b border-gray-300 align-top">Compliance with valid legal requests</td>
              <td className="p-3 border-b border-gray-300 align-top">Reviewed individually</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>We may also disclose aggregate, de‑identified statistics (e.g. number of active users).</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">8 International Transfers</h2>
      <p className="mb-4">Your data may be processed outside your country (e.g. United States). Where we transfer personal data from the EEA/UK we rely on:</p>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li><strong>EU Standard Contractual Clauses (SCCs)</strong>;</li>
        <li>UK IDTA/Addendum; and</li>
        <li>equivalent safeguards recognised under LGPD.</li>
      </ul>
      <p>We monitor developments in privacy law and will update safeguards as required.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">9 Security Measures</h2>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li>TLS 1.3 encryption in transit; AES‑256 at rest.</li>
        <li>Row‑Level Security on every table; access tokens scoped per user.</li>
        <li>Zero‑trust network segmentation; least‑privilege IAM.</li>
        <li>Annual SOC 2 Type II audit of core infrastructure.</li>
        <li>24/7 monitoring and incident‑response plan with 72‑hour breach notification.</li>
      </ul>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">10 Data Retention &amp; Deletion</h2>
      <ul className="list-disc list-inside mb-4 pl-4 space-y-1">
        <li><strong>Girl Threads &amp; uploads</strong> – retained until you delete them or close your account.</li>
        <li><strong>Account</strong> – you may close it at any time; we delete live data within 7 days and backups within 30 days.</li>
        <li><strong>Legal/financial records</strong> – retained up to 7 years as required by law.</li>
      </ul>
      <p>You can request deletion by emailing <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a>.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">11 Your Rights</h2>
      <p className="mb-4">Depending on where you live, you may have rights to:</p>
      <ol className="list-decimal list-inside mb-4 pl-4 space-y-1">
        <li><strong>Access</strong> a copy of your data.</li>
        <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
        <li><strong>Erase</strong> ("right to be forgotten").</li>
        <li><strong>Port</strong> data to another provider.</li>
        <li><strong>Restrict or object</strong> to certain processing.</li>
        <li><strong>Withdraw consent</strong> at any time (processing before withdrawal remains lawful).</li>
        <li><strong>Lodge a complaint</strong> with a Supervisory Authority.</li>
      </ol>
      <p>To exercise any right, email <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a>. We will respond within 30 days.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">12 Region‑Specific Disclosures</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">12.1 European Economic Area &amp; United Kingdom</h3>
        <p className="mb-2">We are established in the <strong>United Kingdom</strong> and therefore do <strong>not</strong> require a separate UK representative under UK‑GDPR Article 27.</p>
        <p className="mb-2">If and when we actively target users in the European Economic Area but maintain no physical presence there, we will appoint an <strong>EU representative</strong> pursuant to EU‑GDPR Article 27 and update this section accordingly.</p>
        <p>Our lead Supervisory Authority for UK matters is the <strong>Information Commissioner's Office (ICO)</strong>.</p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">12.2 California (CCPA/CPRA)</h3>
        <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
          <li>We are a <strong>Service Provider</strong>; we do <strong>not sell or share</strong> personal information for cross‑context behavioural advertising.</li>
          <li>You have the rights to know, delete, correct, and opt‑out of sale/share.</li>
          <li>You may designate an authorised agent to submit requests.</li>
        </ul>
        <p className="text-sm text-gray-600">Categories of personal information collected are listed in section 3 and map to Cal. Civ. Code §1798.140(o).</p>
      </div>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">13 Children</h2>
      <p>The Service is <strong>not intended for children under 18</strong>. We do not knowingly collect personal data from minors. If you believe we have done so, contact us for immediate deletion.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">14 Changes to This Policy</h2>
      <p>We may update this Policy from time to time. The latest version is always available at <strong className="text-gray-900">getharem.com/privacy</strong> and supersedes older versions. Significant changes will be announced via email or in‑app notice at least 7 days before they take effect.</p>
    </section>

    <hr className="my-8 border-gray-300" />

    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">15 Contact Us</h2>
      <p className="mb-4">Questions, concerns or complaints?<br />
        Email <a href="mailto:team@capystudios.xyz" className="text-blue-600 hover:underline">team@capystudios.xyz</a> or write to:
      </p>
      <blockquote className="pl-4 italic border-l-2 border-gray-300 text-gray-600">
        <p>Capybara Studios Ltd.</p>
        <p>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</p>
        <p>Attention: Privacy Team</p>
      </blockquote>
    </section>
    
    <footer className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
      <p>© 2025 Capybara Studios Ltd. All rights reserved.</p>
    </footer>

  </main>
);

export default PrivacyPolicy;
