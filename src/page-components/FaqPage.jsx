"use client"
import { 
  HelpCircle, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail,
  Search
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "EntertainIndia पर किस तरह का कंटेंट पब्लिश होता है?",
      answer: "EntertainIndia पर बॉलीवुड, हॉलीवुड, OTT प्लेटफॉर्म और टीवी इंडस्ट्री से जुड़ी ताज़ा ख़बरें, रिव्यू, और बॉक्स ऑफिस अपडेट्स पब्लिश किए जाते हैं। हम सेलिब्रिटी प्रोफाइल्स और ट्रेंडिंग वेब स्टोरीज़ भी कवर करते हैं।"
    },
    {
      question: "वेबसाइट को दिन में कितनी बार अपडेट किया जाता है?",
      answer: "हमारी डेडिकेटेड टीम वेबसाइट को दिन में कई बार अपडेट करती है। हम मनोरंजन जगत पर लगातार नज़र रखते हैं ताकि कोई भी ब्रेकिंग न्यूज़ आपसे छूट न जाए।"
    },
    {
      question: "क्या फिल्मों और वेब शोज़ के रिव्यू निष्पक्ष (unbiased) होते हैं?",
      answer: "बिल्कुल। हमारी प्राथमिकता 'सटीकता' और 'निष्पक्ष रिपोर्टिंग' है। हमारे क्रिटिक्स बिना किसी बाहरी दबाव या प्रभाव के पूरी ईमानदारी से अपना रिव्यू देते हैं।"
    },
    {
      question: "क्या मैं EntertainIndia के लिए न्यूज़ आर्टिकल लिख सकता हूँ?",
      answer: "हाँ! हम हमेशा नए टैलेंट और लेखकों की तलाश में रहते हैं। अगर आपके पास कोई एक्सक्लूसिव ख़बर है या आप हमारी टीम से जुड़ना चाहते हैं, तो कृपया हमारे Contact पेज के ज़रिए संपर्क करें।"
    },
    {
      question: "क्या आप रीजनल सिनेमा (भोजपुरी, साउथ) भी कवर करते हैं?",
      answer: "हमारा मुख्य फोकस बॉलीवुड और हॉलीवुड पर है, लेकिन हम प्रमुख रीजनल सिनेमा (जैसे टॉलीवुड, कॉलीवुड, भोजपुरी) की बड़ी रिलीज़ और पैन-इंडिया फिल्मों को भी प्रमुखता से कवर करते हैं।"
    },
    {
      question: "मैं EntertainIndia पर विज्ञापन (Advertise) कैसे दे सकता हूँ?",
      answer: "विज्ञापन, स्पॉन्सरशिप और पार्टनरशिप से जुड़ी जानकारी के लिए आप हमारी मार्केटिंग टीम से ads@entertenindia.in पर संपर्क कर सकते हैं।"
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
              <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                मदद और <span className="text-yellow-300">FAQ</span>
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-pink-100 max-w-3xl mx-auto px-4">
              आपके सवाल, हमारे जवाब।
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 120" className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="currentColor" 
              className="text-gray-50 dark:text-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </h3>
                <div className={`p-1 rounded-full transition-colors ${openIndex === index ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-16 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-8 text-center">
          <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            क्या अभी भी आपके मन में कोई सवाल है?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            अगर आपको अपने सवाल का जवाब यहाँ नहीं मिला, तो हमारी टीम आपकी मदद करने के लिए हमेशा तैयार है।
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Mail className="w-5 h-5" />
            संपर्क करें
          </Link>
        </div>

      </div>
    </div>
  );
}