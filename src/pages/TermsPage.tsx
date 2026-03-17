import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="flex items-center p-4 pt-6 bg-white sticky top-0 z-10 border-b border-slate-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors mr-2 text-slate-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Terms & Conditions</h1>
            </div>

            {/* Content */}
            <div className="p-6 prose prose-slate prose-sm pb-24 max-w-none">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 m-0">Legal Agreement</h2>
                        <p className="text-xs text-slate-500 m-0">Effective Date: Today</p>
                    </div>
                </div>

                <div className="space-y-6 text-sm text-slate-600">
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">1. Introduction</h3>
                        <p>
                            Welcome to our DJ Studio Booking Platform. By booking a session and using our studio space, you agree to comply with the following terms and conditions.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">2. Booking and Scheduling</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All studio sessions are booked in 1-hour or 2-hour blocks through our website.</li>
                            <li>Bookings are strictly subject to availability and are only confirmed once payment is verified.</li>
                            <li>Please arrive on time. Your booking duration will not be extended if you arrive late.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">3. Payment Policy</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>We accept manual payments via Touch 'n Go (TNG) eWallet and direct Bank Transfer.</li>
                            <li>To secure your slot, you must upload a clear screenshot of your payment receipt during the checkout process.</li>
                            <li>Your booking status will remain pending until our admin team reviews and approves the uploaded receipt.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">4. Cancellation and Refunds</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Cancellations must be made at least 24 hours before your scheduled session to be eligible for a full refund or rescheduling.</li>
                            <li>Cancellations made less than 24 hours before the session are strictly non-refundable.</li>
                            <li>No-shows will not be refunded under any circumstances.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">5. Studio Rules and Equipment Care</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Treat all DJ equipment, speakers, and studio property with respect.</li>
                            <li>No food or open drinks are allowed directly on or near the equipment tables.</li>
                            <li>Smoking and illegal substances are strictly prohibited inside the studio premises.</li>
                            <li>Please leave the studio clean and ensure all equipment is left in its original condition at the end of your session.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">6. Liability for Damages</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You are fully responsible for any damage caused to the studio equipment or property during your booked session.</li>
                            <li>In the event of broken or damaged equipment due to misuse or negligence, you will be directly billed for the repair or full replacement costs.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
