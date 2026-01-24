'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 scanline-overlay z-0 opacity-20 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
          PRIVACY POLICY
        </h1>
        <p className="text-slate-500 uppercase tracking-widest text-sm mb-12">Last Updated: January 2024</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">1. Introduction</h2>
            <p>
              PKA291 OSINT Platform ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Information you provide directly (username, password, email)</li>
              <li>Information collected through your use of the platform (search history, API usage)</li>
              <li>IP address and device information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">3. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>To provide, maintain, and improve our platform</li>
              <li>To process transactions and send related information</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To monitor and analyze usage trends and activities</li>
              <li>To detect, prevent, and address fraud and security issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">4. Data Protection</h2>
            <p>
              We implement comprehensive security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>AES-256 encryption for data transmission and storage</li>
              <li>Secure API authentication mechanisms</li>
              <li>Regular security audits and assessments</li>
              <li>Access controls and role-based permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and maintain certain information about you. You can configure your browser to refuse all cookies, but this may limit your ability to use certain features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">6. Third-Party Services</h2>
            <p>
              We may use third-party services for payment processing, analytics, and other business purposes. These services are bound by their own privacy policies and we are not responsible for their practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">7. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have certain rights regarding your personal data, including the right to access, correct, or delete your information. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our practices, please contact us via Telegram:
            </p>
            <p className="text-[#ec1313] font-bold mt-4">t.me/pka291_osint</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">9. Changes to Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The most current version will always be available on our website. Your continued use of the platform following the posting of revised Privacy Policy means that you accept and agree to the changes.
            </p>
          </section>

          <section className="pt-8 border-t border-[rgba(236,19,19,0.2)]">
            <p className="text-sm text-slate-600">
              PKA291 © 2024 | All rights reserved
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
