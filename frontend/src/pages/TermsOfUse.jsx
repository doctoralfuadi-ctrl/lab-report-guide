import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MidScopeIcon from "../components/MidScopeIcon";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#FDFBF6] py-12 px-6" data-testid="terms-page">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-600 mb-8" data-testid="terms-back">
          <ArrowLeft className="w-4 h-4" /> Back to MidScope
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <MidScopeIcon className="w-6 h-6" color="white" strokeWidth={2.2} />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Terms of Use</h1>
        </div>

        <div className="prose prose-slate prose-sm max-w-none space-y-6">
          <p className="text-slate-500 text-xs">Last updated: June 2025</p>

          <section>
            <h2 className="font-display font-bold text-lg">1. Acceptance</h2>
            <p>By using MidScope (\u201cthe Service\u201d), you agree to these Terms. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">2. Service Description</h2>
            <p>MidScope is an AI-powered laboratory report interpretation tool. It provides educational explanations of lab results for patients and healthcare professionals. The Service does NOT provide medical diagnoses, treatment plans, or replace professional medical consultation.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">3. Medical Disclaimer</h2>
            <p><strong>IMPORTANT:</strong> MidScope is an educational tool only. Its outputs are NOT medical advice. Always consult a qualified healthcare provider for diagnosis and treatment decisions. Never disregard professional medical advice or delay seeking it because of something you read on MidScope.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">4. User Responsibilities</h2>
            <ul>
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You are responsible for the accuracy of data you upload.</li>
              <li>You must not upload data belonging to others without their consent.</li>
              <li>You must not attempt to reverse-engineer, abuse, or overload the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">5. Privacy & Data</h2>
            <p>Uploaded files are processed transiently for analysis and are not permanently stored on our servers. We do not sell or share your health data with third parties. Anonymized usage statistics may be collected to improve the Service.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">6. Subscription & Payments</h2>
            <p>Paid tiers (Standard, Premium, Royal) are billed annually via Stripe. Refunds are available within 7 days of purchase if fewer than 3 analyses have been performed. Prices may change with 30 days\u2019 notice.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">7. Intellectual Property</h2>
            <p>All MidScope branding, design, and code are owned by the Service operator. You retain ownership of your uploaded data. AI-generated interpretations are provided under a personal-use license.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, MidScope and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Service, including but not limited to health decisions made based on AI interpretations.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">9. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may cancel your subscription at any time through the account management interface.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">10. Changes to Terms</h2>
            <p>We may update these Terms periodically. Continued use after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg">11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@midscope.app" className="text-brand-600 hover:text-brand-500">support@midscope.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-100 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} MidScope. All rights reserved.
        </div>
      </div>
    </div>
  );
}
