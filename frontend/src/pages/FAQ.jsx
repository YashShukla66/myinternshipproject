import React from 'react';

const faqs = [
    {
        question: "How do I add a new vehicle?",
        answer: "You can add a new vehicle by navigating to the Vehicles page and clicking the 'Add Vehicle' button. Fill in the required details and save."
    },
    {
        question: "How can I track a trip?",
        answer: "Go to the Trips section. You will see a list of ongoing and completed trips. Click on a specific trip to view its details and current status."
    },
    {
        question: "What should I do if a vehicle needs maintenance?",
        answer: "Navigate to the Maintenance page, click 'Log Maintenance', and enter the vehicle's issue, scheduled date, and required service details."
    },
    {
        question: "How do I chat with support?",
        answer: "You can use the Tawk.to chat widget located at the bottom right corner of the screen to talk with our support team in real-time."
    }
];

export default function FAQ() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Frequently Asked Questions</h1>
                <p className="text-slate-400">Find answers to common questions about using the Fleet Management Dashboard.</p>
            </div>

            <div className="grid gap-6 max-w-4xl">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                        <div className="px-6 py-4 border-b border-slate-800/50">
                            <h3 className="text-lg font-semibold text-indigo-400">{faq.question}</h3>
                        </div>
                        <div className="px-6 py-4 text-slate-300">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
                <p className="text-slate-300 mb-4">
                    Our support team is available 24/7. Use the chat widget in the bottom right corner or reach out via email.
                </p>
                <a href="mailto:support@fleetmanagement.com" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-block">
                    Email Support
                </a>
            </div>
        </div>
    );
}
