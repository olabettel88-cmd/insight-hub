'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 scanline-overlay z-0 opacity-20 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4" style={{ textShadow: '2px 0 #ec1313, -2px 0 #000' }}>
          TERMS OF SERVICE
        </h1>
        <p className="text-slate-500 uppercase tracking-widest text-sm mb-12">Last Updated: January 2024</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PKA291 OSINT Platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on PKA291 OSINT Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">3. Disclaimer</h2>
            <p>
              The materials on PKA291 OSINT Platform are provided on an 'as is' basis. PKA291 makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">4. Limitations</h2>
            <p>
              In no event shall PKA291 or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PKA291's website, even if PKA291 or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on PKA291 OSINT Platform could include technical, typographical, or photographic errors. PKA291 does not warrant that any of the materials on its website are accurate, complete, or current. PKA291 may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">6. Links</h2>
            <p>
              PKA291 has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PKA291 of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">7. Modifications</h2>
            <p>
              PKA291 may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#ec1313]">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which PKA291 operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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
