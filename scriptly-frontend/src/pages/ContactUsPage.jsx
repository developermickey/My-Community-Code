import React, { useState } from "react";
import { toast } from "react-toastify"; // Import toast

// Simple Loading Spinner Component (reuse from other pages or create a dedicated shared component)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-lg text-gray-600">Sending...</p>
  </div>
);

function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic client-side validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // --- IMPORTANT NOTE: This is a simulated submission for frontend UI. ---
    // For a real-world application, you would send this data to your backend API.
    // Example:
    // try {
    //   await axios.post(`${API_URL}/contact`, { name, email, message });
    //   toast.success("Your message has been sent successfully!");
    //   setName("");
    //   setEmail("");
    //   setMessage("");
    // } catch (error) {
    //   console.error("Contact form submission error:", error);
    //   toast.error("Failed to send message. Please try again later.");
    // } finally {
    //   setLoading(false);
    // }

    // Simulate API call success/failure for demonstration purposes
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    if (Math.random() > 0.1) {
      // 90% chance of success
      toast.success(
        "Your message has been sent successfully! We'll get back to you soon."
      );
      setName("");
      setEmail("");
      setMessage("");
    } else {
      toast.error("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-[calc(100vh-140px)]">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-10 bg-gradient-to-r from-green-500 to-blue-500 p-8 rounded-xl shadow-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Get In <span className="block md:inline">Touch!</span>
          </h1>
          <p className="text-lg md:text-xl text-white opacity-90 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us for any questions,
            feedback, or collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Form Section */}
          <div className="bg-white p-8 rounded-lg shadow-xl border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-blue-500 mr-2">✉️</span> Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Your Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Your Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Your Message:
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={loading}
                ></textarea>
              </div>
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 inline-flex items-center"
                  disabled={loading}
                >
                  {loading && <LoadingSpinner />} {/* Use local spinner here */}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white p-8 rounded-lg shadow-xl border border-blue-100 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-green-500 mr-2">📞</span> Contact
                Information
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <a
                    href="mailto:info@scriptlycommunity.com"
                    className="hover:underline"
                  >
                    info@scriptlycommunity.com
                  </a>
                </p>
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a href="tel:+911234567890" className="hover:underline">
                    +91 12345 67890
                  </a>{" "}
                  {/* Updated phone number for India */}
                </p>
                <p className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  123 Code Street, Tech City, Indore, India{" "}
                  {/* Example address */}
                </p>
              </div>
            </div>
            {/* Simple Map Placeholder */}
            <div className="mt-8 rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.5298533161395!2d75.89066601490299!3d22.990422984979148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fc6887569107%3A0x6b7b7a7f4c0a5e8!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1678893649876!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;
