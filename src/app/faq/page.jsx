"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/**
 * A helper function to safely parse a JSON string.
 * It returns the parsed object if successful, otherwise returns null.
 */
const safeJsonParse = (str) => {
  try {
    const parsed = JSON.parse(str);
    // Ensure the parsed object has the expected structure
    if (parsed && typeof parsed === 'object' && parsed.questions && Array.isArray(parsed.questions)) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export default function FAQPage() {
  const [faqContent, setFaqContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const contentRefs = useRef([]);

  useEffect(() => {
    async function fetchFaqs() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/content?type=faq");
        const data = await res.json();
        
        if (data.success && data.content.length > 0) {
          // Find the FAQ item that has the new structured content
          const structuredFaq = data.content.find(item => safeJsonParse(item.content));
          
          if (structuredFaq) {
            // Parse the content and set it to the state
            setFaqContent(safeJsonParse(structuredFaq.content));
          } else {
            // If no structured FAQ found, but other FAQs exist (old format),
            // you might want to handle this case, e.g., by creating a new structured object.
            // For now, let's assume if a structured FAQ doesn't exist, we'll display an empty state or the old ones.
            setFaqContent(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  useEffect(() => {
    // Add class to all anchor tags inside FAQ content
    contentRefs.current.forEach((ref) => {
      if (ref) {
        ref.querySelectorAll("a").forEach((a) => {
          a.classList.add("text-primary-600", "hover:underline");
        });
      }
    });
  }, [faqContent, openIndex]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const questions = faqContent?.questions || [];

  return (
    <div className="bg-[#000] min-h-screen flex justify-center items-center">
      <div className="container mx-auto px-4 py-16 w-full">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            {faqContent?.title || "Frequently Asked Questions"}
          </h1>
          <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-300">
            {faqContent?.description || "Everything you need to know about Sublmnl and subliminal audio"}
          </p>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading FAQs...</div>
            ) : questions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No FAQs found.</div>
            ) : (
              // This map function creates a separate accordion for each question-answer pair
              questions.map((qna, index) => (
                <div
                  key={index} // Use index as key since the questions array doesn't have an _id
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openIndex === index}
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {qna.question}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 dark:text-gray-300 transition-transform duration-200 ${
                        openIndex === index ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openIndex === index && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                      <div
                        className="text-gray-700 dark:text-gray-300"
                        ref={(el) => (contentRefs.current[index] = el)}
                      >
                        {/* Split the answer by double newlines to create separate paragraphs */}
                        {qna.answer.split(/\n\n/).map((paragraph, pIndex) => (
                          <p key={pIndex} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're here to help! Reach out to our support team.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#e4ffa8]/70 to-[#b1d239]/70  text-black font-medium rounded-lg hover:bg-secondary-700 transition-colors hover:font-bold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}