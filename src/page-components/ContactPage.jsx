"use client";
import { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessagesSquare, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Headphones,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { contactMessagesAPI } from "../lib/api";
import { useStore } from "../store/useStore";
import Link from "next/link";
import { SOCIAL_LINKS } from "../lib/constants";
export default function ContactPage() {
  const { user, isAuthenticated } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await contactMessagesAPI.submit({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setSuccessMessage("मैसेज सफलतापूर्वक भेजा गया! हम जल्द ही आपसे संपर्क करेंगे।");
      
      setFormData({
        name: isAuthenticated ? (user.username || "") : "",
        email: isAuthenticated ? (user.email || "") : "",
        subject: "",
        message: "",
      });

    } catch (err) {
      console.error(err);
      setErrorMessage("कुछ गलत हो गया! कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "ईमेल करें",
      details: ["entertainindia.in@gmail.com"],
      action: "mailto:entertainindia.in@gmail.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "फोन करें",
      details: ["+915672297509"],
      action: "tel:+915672297509"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "हमसे मिलें",
      details: ["हॉस्पिटल रोड, कुरावली मैनपुरी, उत्तर प्रदेश", "भारत - 205265"],
      action: "https://maps.app.goo.gl/6fM1xnVnUykpimda8"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "कार्यालय समय",
      details: ["सोमवार - शुक्रवार: सुबह 9 - शाम 6", "शनिवार: सुबह 10 - शाम 4"],
      action: null
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "https://facebook.com/entertainindia", label: "फेसबुक" },
    { icon: <Twitter className="w-5 h-5" />, href: "https://x.com/EIndia99460", label: "ट्विटर" },
    { icon: <Instagram className="w-5 h-5" />, href: "https://instagram.com/entertainindia", label: "इंस्टाग्राम" },
    { icon: <Youtube className="w-5 h-5" />, href: "https://youtube.com/entertainindia", label: "यूट्यूब" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com/company/entertainindia", label: "लिंक्डइन" }
  ];

  const faqs = [
    {
      question: "कितनी जल्दी जवाब मिलता है?",
      answer: "हम आमतौर पर कार्य दिवसों में 24-48 घंटे के भीतर जवाब देते हैं।"
    },
    {
      question: "क्या मैं कोई स्टोरी टिप भेज सकता हूं?",
      answer: "बिल्कुल! कृपया कॉन्टैक्ट फॉर्म में 'स्टोरी टिप' सब्जेक्ट लाइन में लिखें।"
    },
    {
      question: "क्या आप गेस्ट पोस्ट स्वीकार करते हैं?",
      answer: "हां, करते हैं! कृपया अपना आर्टिकल आइडिया मैसेज में शामिल करें।"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Section - Fixed */}
      <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden min-h-[500px] flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
              <MessagesSquare className="w-10 h-10 sm:w-12 sm:h-12" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                संपर्क <span className="text-yellow-300">करें</span>
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-pink-100 max-w-3xl mx-auto mb-6 px-4">
              हम आपकी सहायता के लिए यहां हैं
            </p>
            <p className="text-base sm:text-lg text-pink-100/90 max-w-2xl mx-auto px-4">
              कोई सवाल, स्टोरी टिप या फीडबैक? हमारी टीम आपकी सहायता के लिए तैयार है।
            </p>
          </div>
        </div>

        {/* Wave Divider - Fixed */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 120" className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="currentColor" 
              className="text-gray-50 dark:text-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                {info.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{info.title}</h3>
              {info.details.map((detail, i) => (
                <p key={i} className="text-gray-600 dark:text-gray-400 text-sm">{detail}</p>
              ))}
              {info.action && (
                <Link 
                  href={info.action}
                  className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400 text-sm font-medium mt-3 hover:gap-2 transition-all"
                >
                  {info.title === "ईमेल करें" ? "ईमेल भेजें" : info.title === "फोन करें" ? "फोन करें" : "मैप पर देखें"}
                  <span>→</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  हमें मैसेज भेजें
                </h2>
                <p className="text-pink-100 mt-1">हम आपसे सुनना पसंद करेंगे</p>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mx-8 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 dark:text-green-200 text-sm">{successMessage}</p>
                </div>
              )}

              {errorMessage && (
                <div className="mx-8 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 dark:text-red-200 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      आपका नाम <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 
                                 border border-gray-300 dark:border-gray-600 
                                 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-pink-500 focus:border-transparent
                                 transition-all"
                      placeholder="राहुल शर्मा"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ईमेल पता <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 
                                 border border-gray-300 dark:border-gray-600 
                                 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-pink-500 focus:border-transparent
                                 transition-all"
                      placeholder="rahul@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    विषय <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 
                               border border-gray-300 dark:border-gray-600 
                               text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-pink-500 focus:border-transparent
                               transition-all"
                    placeholder="हम आपकी कैसे मदद कर सकते हैं?"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    संदेश <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="6"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 
                               border border-gray-300 dark:border-gray-600 
                               text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-pink-500 focus:border-transparent
                               transition-all resize-none"
                    placeholder="अपनी पूछताछ के बारे में विस्तार से बताएं..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 
                             hover:from-pink-700 hover:to-rose-700
                             text-white font-semibold py-4 px-6 rounded-lg
                             flex items-center justify-center gap-2
                             transition-all duration-200 shadow-md hover:shadow-lg
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      भेज रहा है...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      संदेश भेजें
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  यह फॉर्म सबमिट करके, आप हमारी{" "}
                  <Link href="/privacy-policy" className="text-pink-600 dark:text-pink-400 hover:underline">
                    गोपनीयता नीति
                  </Link>{" "}
                  से सहमत होते हैं
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Quick Response Card */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-8 text-white">
              <Headphones className="w-12 h-12 text-white/80 mb-4" />
              <h3 className="text-xl font-bold mb-2">त्वरित प्रतिक्रिया</h3>
              <p className="text-pink-100 mb-4">
                हम 24-48 घंटे के भीतर सभी पूछताछ का जवाब देने का प्रयास करते हैं।
              </p>
              <div className="flex items-center gap-2 text-sm text-pink-100">
                <Clock className="w-4 h-4" />
                <span>सोम-शुक्र: सुबह 9 - शाम 6 (भारतीय समय)</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                हमसे जुड़ें
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg 
                               flex items-center justify-center text-gray-600 dark:text-gray-300
                               hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600
                               transition-all"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                अक्सर पूछे जाने वाले सवाल
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{faq.question}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-8 h-8" />
                <span className="ml-2">कुरावली कार्यालय</span>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">हमारे कार्यालय आएं</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  हॉस्पिटल रोड, कुरावली, मैनपुरी<br/> 
उत्तर प्रदेश 205265
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ईमेल न्यूजलेटर पसंद करते हैं?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            नवीनतम मनोरंजन समाचार, समीक्षा और अपडेट के लिए हमारे न्यूजलेटर को सब्सक्राइब करें!
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="अपना ईमेल डालें"
              className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-r-lg font-medium transition-colors">
              सब्सक्राइब
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}