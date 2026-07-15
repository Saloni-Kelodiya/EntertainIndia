import React from "react";
import { 
  Scale, 
  FileText, 
  User, 
  Lock, 
  Globe, 
  AlertCircle, 
  Mail, 
  ExternalLink,
  Shield,
  Database,
  Cookie,
  Gavel
} from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString("hi-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "1. हमारी सेवा का उपयोग",
      content: [
        "आप सेवा का उपयोग केवल कानूनी उद्देश्यों और इन शर्तों के अनुपालन में कर सकते हैं।",
        "आप सेवा या सर्वरों का दुरुपयोग, हैक, हस्तक्षेप या बाधित नहीं करने के लिए सहमत हैं।",
        "आप दुर्भावनापूर्ण कोड, वायरस या हानिकारक सामग्री अपलोड नहीं कर सकते।",
        "आपको सभी लागू स्थानीय, राज्य, राष्ट्रीय और अंतर्राष्ट्रीय कानूनों का पालन करना होगा।",
        "हम किसी भी अवैध या अनधिकृत उपयोग के खिलाफ जांच करने और उचित कानूनी कार्रवाई करने का अधिकार सुरक्षित रखते हैं।"
      ]
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "2. खाते",
      content: [
        "जब आप खाता बनाते हैं, तो आपको सटीक और पूरी जानकारी प्रदान करनी होगी।",
        "अपने खाते के क्रेडेंशियल्स की गोपनीयता बनाए रखने के लिए आप पूरी तरह से जिम्मेदार हैं।",
        "आपके खाते के तहत होने वाली सभी गतिविधियों के लिए आप जिम्मेदार हैं।",
        "किसी भी अनधिकृत उपयोग या सुरक्षा उल्लंघन की तुरंत हमें सूचना दें।",
        "हम इन शर्तों का उल्लंघन करने वाले खातों को निलंबित या समाप्त करने का अधिकार सुरक्षित रखते हैं।"
      ]
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "3. बौद्धिक संपदा अधिकार",
      content: [
        "इस सेवा पर सभी सामग्री - जिसमें टेक्स्ट, ग्राफिक्स, लोगो, आइकन, इमेज, ऑडियो क्लिप, डिजिटल डाउनलोड, डेटा संकलन और सॉफ्टवेयर शामिल हैं - हमारी संपत्ति है या हमें लाइसेंस प्राप्त है।",
        "सामग्री कॉपीराइट, ट्रेडमार्क और अन्य बौद्धिक संपदा कानूनों द्वारा संरक्षित है।",
        "आप हमारी लिखित अनुमति के बिना कॉपी, पुनरुत्पादित, वितरित, प्रसारित, प्रदर्शित, बेच, लाइसेंस या व्युत्पन्न कार्य नहीं बना सकते।",
        "एंटरटेनइंडिया नाम और लोगो ट्रेडमार्क हैं - आप पूर्व लिखित सहमति के बिना उनका उपयोग नहीं कर सकते।"
      ]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "4. उपयोगकर्ता सामग्री",
      content: [
        "सामग्री (समीक्षा, टिप्पणियां, रेटिंग) सबमिट करके, आप हमें ऐसी सामग्री का उपयोग, पुनरुत्पादन, संशोधित, अनुकूलित, प्रकाशित और प्रदर्शित करने के लिए एक गैर-अनन्य, विश्वव्यापी, रॉयल्टी-मुक्त लाइसेंस प्रदान करते हैं।",
        "आप अपनी सामग्री का स्वामित्व बनाए रखते हैं, लेकिन आप हमें इसका उपयोग करने की अनुमति देते हैं।",
        "आप पुष्टि करते हैं कि आपके पास किसी भी सामग्री का स्वामित्व है या आवश्यक अधिकार हैं जो आप सबमिट करते हैं।",
        "हमें किसी भी सामग्री को हटाने का अधिकार है जो इन शर्तों का उल्लंघन करती है या अन्यथा आपत्तिजनक है।"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "5. गोपनीयता और डेटा संरक्षण",
      content: [
        "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। कृपया हमारी गोपनीयता नीति की समीक्षा करें कि हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।",
        "हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए सुरक्षा उपाय लागू करते हैं।",
        "हमारी सेवा का उपयोग करके, आप गोपनीयता नीति में वर्णित हमारी डेटा प्रथाओं के लिए सहमति देते हैं।"
      ],
      link: {
        text: "हमारी गोपनीयता नीति पढ़ें",
        href: "/privacy-policy"
      }
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "6. तृतीय-पक्ष लिंक",
      content: [
        "हमारी सेवा में तृतीय-पक्ष वेबसाइटों, विज्ञापनदाताओं, सेवाओं या संसाधनों के लिंक हो सकते हैं।",
        "हम तृतीय पक्षों की सामग्री, उत्पादों या सेवाओं का समर्थन नहीं करते हैं और उनके लिए जिम्मेदार नहीं हैं।",
        "तृतीय-पक्ष साइटों के साथ आपकी बातचीत पूरी तरह से आपके और तृतीय पक्ष के बीच है।",
        "हम आपको किसी भी तृतीय-पक्ष वेबसाइट पर जाने से पहले उनकी शर्तों और गोपनीयता नीतियों को पढ़ने के लिए प्रोत्साहित करते हैं।"
      ]
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "7. अस्वीकरण",
      content: [
        "सेवा 'जैसी है' और 'जैसी उपलब्ध है' प्रदान की जाती है, बिना किसी प्रकार की वारंटी के।",
        "हम गारंटी नहीं देते कि सेवा निर्बाध, समय पर, सुरक्षित या त्रुटि-मुक्त होगी।",
        "हम किसी भी सामग्री की सटीकता, विश्वसनीयता या पूर्णता के बारे में कोई वारंटी नहीं देते हैं।",
        "सेवा का आपका उपयोग पूरी तरह से आपके अपने जोखिम पर है।"
      ]
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "8. दायित्व की सीमा",
      content: [
        "कानून द्वारा अनुमत अधिकतम सीमा तक, एंटरटेनइंडिया किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी या दंडात्मक क्षतियों के लिए उत्तरदायी नहीं होगा।",
        "इसमें लाभ, डेटा, साख या अन्य अमूर्त हानियों का नुकसान शामिल है।",
        "हमारी कुल देयता पिछले छह महीनों के दौरान आपके द्वारा भुगतान की गई राशि (यदि कोई हो) से अधिक नहीं होगी।",
        "कुछ क्षेत्राधिकार दायित्व की सीमाओं की अनुमति नहीं देते हैं, इसलिए यह आप पर लागू नहीं हो सकता है।"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "9. समाप्ति",
      content: [
        "हम बिना किसी पूर्व सूचना के, इन शर्तों के किसी भी उल्लंघन के लिए आपके खाते और सेवा तक पहुंच तुरंत समाप्त या निलंबित कर सकते हैं।",
        "समाप्ति पर, सेवा का उपयोग करने का आपका अधिकार तुरंत समाप्त हो जाएगा।",
        "शर्तों के वे सभी प्रावधान जो समाप्ति के बाद भी जीवित रहने चाहिए, जीवित रहेंगे (स्वामित्व प्रावधान, वारंटी अस्वीकरण और दायित्व की सीमाएं सहित)।"
      ]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "10. शर्तों में परिवर्तन",
      content: [
        "हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं।",
        "हम इस पृष्ठ पर अद्यतन शर्तों को पोस्ट करके और 'अंतिम अद्यतन' तिथि को अपडेट करके महत्वपूर्ण परिवर्तनों की सूचना प्रदान करेंगे।",
        "परिवर्तनों के बाद सेवा का आपका निरंतर उपयोग नई शर्तों की स्वीकृति माना जाएगा।",
        "यदि आप परिवर्तनों से सहमत नहीं हैं, तो कृपया सेवा का उपयोग बंद कर दें।"
      ]
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "11. लागू कानून",
      content: [
        "ये शर्तें भारत के कानूनों द्वारा शासित होंगी, उनके कानून संघर्ष प्रावधानों के बिना।",
        "इन शर्तों के तहत उत्पन्न होने वाले किसी भी विवाद मुंबई, भारत की अदालतों के अनन्य क्षेत्राधिकार के अधीन होंगे।",
        "हम किसी भी क्षेत्राधिकार में निषेधाज्ञा राहत प्राप्त करने का अधिकार सुरक्षित रखते हैं।"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section - Fixed */}
      <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden min-h-[450px] flex items-center">
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
              <Scale className="w-10 h-10 sm:w-12 sm:h-12" />
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                सेवा की <span className="text-yellow-300">शर्तें</span>
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-pink-100 max-w-3xl mx-auto mb-6 px-4">
              कृपया एंटरटेनइंडिया का उपयोग करने से पहले इन शर्तों को ध्यान से पढ़ें
            </p>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/30">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">अंतिम अद्यतन: {currentDate}</span>
              </div>
            </div>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick Summary Card */}
        <div className="mb-12 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-pink-900 dark:text-pink-200 mb-2">त्वरित सारांश</h2>
              <p className="text-pink-800 dark:text-pink-300">
                एंटरटेनइंडिया का उपयोग करके, आप इन शर्तों से सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।
                यदि आपके कोई प्रश्न हैं, तो नीचे दिए गए ईमेल पर हमसे संपर्क करें।
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 p-6 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-600 dark:text-pink-400">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              
              {/* Section Content */}
              <div className="p-6 pt-4">
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                      <span className="text-pink-500 font-bold mt-1">•</span>
                      <span className="flex-1 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Optional Link */}
                {section.link && (
                  <Link 
                    href={section.link.href}
                    className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
                  >
                    {section.link.text}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Agreement Section */}
        <div className="mt-12 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-8 border border-pink-200 dark:border-pink-800">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              एंटरटेनइंडिया का उपयोग करके, आप इन शर्तों से सहमत होते हैं
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              यदि आप इन शर्तों के किसी भी भाग से सहमत नहीं हैं, तो कृपया तुरंत हमारी सेवाओं का उपयोग बंद कर दें।
            </p>
            
            {/* Contact Section */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm">
              <Mail className="w-5 h-5 text-pink-500" />
              <span className="text-gray-700 dark:text-gray-300">प्रश्न? हमसे संपर्क करें:</span>
              <a 
                href="mailto:legal@entertainindia.com" 
                className="font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
              >
                legal@entertainindia.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            सेवा की ये शर्तें अंतिम बार {currentDate} को अपडेट की गई थीं।
            पिछले संस्करण ईमेल द्वारा अनुरोध किए जा सकते हैं।
          </p>
        </div>
      </div>
    </div>
  );
}