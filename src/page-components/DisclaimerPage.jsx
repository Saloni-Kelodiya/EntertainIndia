"use client"
import { 
  AlertTriangle, 
  Scale, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  MessageSquare, 
  FileWarning,
  Calendar,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

export default function DisclaimerPage() {
  const currentDate = new Date().toLocaleDateString("hi-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const sections = [
    {
      id: "general",
      icon: <FileWarning className="w-6 h-6" />,
      title: "1. सामान्य जानकारी (General Information)",
      content: `EntertainIndia (https://entertenindia.in) पर दी गई सभी जानकारी केवल सामान्य सूचना और मनोरंजन के उद्देश्य से है। हम वेबसाइट पर सटीक और विश्वसनीय जानकारी देने का पूरा प्रयास करते हैं, लेकिन हम किसी भी जानकारी की पूर्णता, सटीकता या उपलब्धता की कोई कानूनी गारंटी नहीं देते हैं।`
    },
    {
      id: "accuracy",
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "2. न्यूज़ और अफवाहें (News & Rumors)",
      content: `मनोरंजन जगत में खबरें बहुत तेज़ी से बदलती हैं। यद्यपि हमारी कोशिश हमेशा सटीक न्यूज़ देने की होती है, लेकिन हमारी कुछ खबरें इंडस्ट्री की अफवाहों, लीक्स या सूत्रों पर आधारित हो सकती हैं। हम आधिकारिक खबरों और अफवाहों के बीच स्पष्ट अंतर रखने का प्रयास करते हैं।`
    },
    {
      id: "external-links",
      icon: <LinkIcon className="w-6 h-6" />,
      title: "3. बाहरी लिंक्स (External Links)",
      content: "हमारी वेबसाइट पर आपको अन्य (थर्ड-पार्टी) वेबसाइटों के लिंक मिल सकते हैं। ये लिंक्स केवल आपकी सुविधा के लिए दिए जाते हैं। हम इन बाहरी वेबसाइटों के कंटेंट, सटीकता या प्राइवेसी पॉलिसी के लिए ज़िम्मेदार नहीं हैं।",
      note: "किसी भी बाहरी लिंक पर क्लिक करके वहां दी गई जानकारी का उपयोग करना पूरी तरह से आपके अपने जोखिम (Risk) पर है।"
    },
    {
      id: "copyright",
      icon: <ImageIcon className="w-6 h-6" />,
      title: "4. कॉपीराइट और फेयर यूज़ (Copyright & Fair Use)",
      content: `EntertainIndia बौद्धिक संपदा (Intellectual Property) अधिकारों का पूरा सम्मान करता है। वेबसाइट पर इस्तेमाल की गई तस्वीरें, पोस्टर, प्रोमोशनल सामग्री और वीडियो क्लिप्स उनके संबंधित कॉपीराइट धारकों की संपत्ति हैं।`,
      points: [
        "इन सामग्रियों का उपयोग न्यूज़ रिपोर्टिंग, रिव्यू और चर्चा के उद्देश्य से 'Fair Use' (उचित उपयोग) नीति के तहत किया गया है।",
        "हम किसी भी थर्ड-पार्टी मूवी पोस्टर या स्टिल्स के मालिकाना हक़ का दावा नहीं करते।",
        "यदि आप किसी कंटेंट के कॉपीराइट मालिक हैं और आपको लगता है कि बिना अनुमति के आपका कंटेंट इस्तेमाल हुआ है, तो कृपया उसे हटाने के लिए तुरंत हमसे संपर्क करें।"
      ]
    },
    {
      id: "personal-views",
      icon: <MessageSquare className="w-6 h-6" />,
      title: "5. रिव्यू और निजी विचार (Reviews & Opinions)",
      content: `EntertainIndia पर पब्लिश किए गए फिल्मों, टीवी शोज़ और OTT सीरीज़ के रिव्यू पूरी तरह से हमारे लेखकों और क्रिटिक्स के निजी विचार हैं। यह ज़रूरी नहीं कि वो विचार वेबसाइट या हमारी पूरी टीम के हों। रिव्यू व्यक्तिपरक (Subjective) होते हैं, इसलिए दर्शकों को अपने विवेक का इस्तेमाल करना चाहिए।`
    },
    {
      id: "liability",
      icon: <Scale className="w-6 h-6" />,
      title: "6. जवाबदेही की सीमा (Limitation of Liability)",
      content: `इस वेबसाइट के उपयोग, या वेबसाइट पर दी गई किसी भी जानकारी पर भरोसा करने के परिणामस्वरूप होने वाले किसी भी नुकसान (प्रत्यक्ष या अप्रत्यक्ष) के लिए EntertainIndia या हमारी टीम किसी भी परिस्थिति में ज़िम्मेदार नहीं होगी।`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden min-h-[450px] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12" />
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                अस्वीकरण (Disclaimer)
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-pink-100 max-w-3xl mx-auto mb-6 px-4">
              महत्वपूर्ण कानूनी जानकारी
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
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Quick Summary Card */}
        <div className="mb-12 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Scale className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-pink-900 dark:text-pink-200 mb-2">सहमति (Consent)</h2>
              <p className="text-pink-800 dark:text-pink-300">
                हमारी वेबसाइट का उपयोग करके, आप हमारे Disclaimer से सहमत होते हैं और इसकी शर्तों को स्वीकार करते हैं। यदि आपको हमारे Disclaimer के बारे में और अधिक जानकारी चाहिए या कोई प्रश्न हैं, तो कृपया बेझिझक हमसे संपर्क करें।
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section 
              key={section.id} 
              id={section.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-600 dark:text-pink-400">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              
              <div className="p-6 pt-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {section.content}
                </p>
                
                {section.points && (
                  <ul className="space-y-3 mt-4">
                    {section.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 dark:text-gray-300">{point}</p>
                      </li>
                    ))}
                  </ul>
                )}
                
                {section.note && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>कृपया ध्यान दें:</strong> {section.note}
                    </p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Return to home CTA */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-semibold transition-colors"
          >
            होमपेज पर वापस जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}