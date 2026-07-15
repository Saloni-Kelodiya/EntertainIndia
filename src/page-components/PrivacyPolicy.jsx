"use client"
import { 
  Shield, 
  Lock, 
  Cookie, 
  Eye, 
  Globe, 
  Mail, 
  AlertCircle,
  Database,
  Users,
  Share2,
  FileText,
  Calendar,
  ChevronRight,
  ExternalLink,
  Settings,
  Trash2,
  Download,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState(null);
  const [cookieConsent, setCookieConsent] = useState(false);
  
  const currentDate = new Date().toLocaleDateString("hi-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  useEffect(() => {
    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      id: "introduction",
      icon: <Shield className="w-6 h-6" />,
      title: "1. परिचय",
      content: `एंटरटेनइंडिया ("हम", "हमारा") आपकी निजता की सुरक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति विस्तार से बताती है कि हम आपकी जानकारी कैसे एकत्र, उपयोग, खुलासा और संरक्षित करते हैं जब आप हमारी वेबसाइट पर जाते हैं या हमारी सेवाओं का उपयोग करते हैं। एंटरटेनइंडिया तक पहुंचकर या उसका उपयोग करके, आप स्वीकार करते हैं कि आपने इस नीति में वर्णित प्रथाओं को पढ़ा, समझा और सहमति दी है।`
    },
    {
      id: "information-collection",
      icon: <Database className="w-6 h-6" />,
      title: "2. हम क्या जानकारी एकत्र करते हैं",
      points: [
        {
          title: "व्यक्तिगत जानकारी",
          desc: "नाम, ईमेल पता, उपयोगकर्ता नाम, और अन्य संपर्क विवरण जब आप खाता बनाते हैं, हमारे न्यूजलेटर की सदस्यता लेते हैं, या हमसे संपर्क करते हैं।"
        },
        {
          title: "उपयोगकर्ता-जनित सामग्री",
          desc: "टिप्पणियां, समीक्षाएं, रेटिंग्स, और अन्य सामग्री जो आप हमारे प्लेटफॉर्म पर सबमिट करते हैं।"
        },
        {
          title: "उपयोग डेटा",
          desc: "ब्राउज़र प्रकार, डिवाइस जानकारी, आईपी पता, देखे गए पेज, बिताया गया समय, और अन्य विश्लेषणात्मक डेटा स्वचालित रूप से एकत्र किया जाता है।"
        },
        {
          title: "संचार प्राथमिकताएं",
          desc: "न्यूजलेटर, अपडेट और प्रचार सामग्री प्राप्त करने के लिए आपकी प्राथमिकताएं।"
        }
      ]
    },
    {
      id: "information-usage",
      icon: <Eye className="w-6 h-6" />,
      title: "3. हम आपकी जानकारी का उपयोग कैसे करते हैं",
      points: [
        "हमारी वेबसाइट और सेवाओं को प्रदान, बनाए रखना और सुधारना",
        "आपको न्यूजलेटर, अपडेट और प्रचार सामग्री भेजना (आपकी सहमति से)",
        "आपकी टिप्पणियों, सवालों और अनुरोधों का जवाब देना",
        "आपके अनुभव को व्यक्तिगत बनाना और अनुकूलित सामग्री देना",
        "उपयोग पैटर्न और ट्रेंड्स की निगरानी और विश्लेषण करना",
        "तकनीकी समस्याओं या सुरक्षा उल्लंघनों का पता लगाना, रोकना और समाधान करना",
        "कानूनी दायित्वों का पालन करना और हमारी शर्तों को लागू करना"
      ]
    },
    {
      id: "cookies",
      icon: <Cookie className="w-6 h-6" />,
      title: "4. कुकीज़ और ट्रैकिंग तकनीक",
      content: "हम आपके ब्राउज़िंग अनुभव को बेहतर बनाने, वेबसाइट ट्रैफ़िक का विश्लेषण करने और यह समझने के लिए कुकीज़ और समान ट्रैकिंग तकनीकों का उपयोग करते हैं कि हमारे आगंतुक कहां से आते हैं।",
      points: [
        {
          title: "आवश्यक कुकीज़",
          desc: "बुनियादी वेबसाइट कार्यक्षमता और सुरक्षा के लिए आवश्यक"
        },
        {
          title: "एनालिटिक्स कुकीज़",
          desc: "हमें यह समझने में मदद करती हैं कि आगंतुक हमारी साइट के साथ कैसे इंटरैक्ट करते हैं"
        },
        {
          title: "कार्यात्मक कुकीज़",
          desc: "आपकी प्राथमिकताओं और सेटिंग्स को याद रखती हैं"
        },
        {
          title: "विज्ञापन कुकीज़",
          desc: "प्रासंगिक विज्ञापन देने और अभियान प्रदर्शन ट्रैक करने के लिए उपयोग की जाती हैं"
        }
      ],
      note: "आप अपने ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ प्रबंधित या अक्षम कर सकते हैं। हालांकि, कुछ कुकीज़ अक्षम करने से वेबसाइट कार्यक्षमता प्रभावित हो सकती है।"
    },
    {
      id: "third-party",
      icon: <Globe className="w-6 h-6" />,
      title: "5. तृतीय-पक्ष सेवाएं",
      content: "हम वेबसाइट ट्रैफ़िक का विश्लेषण करने, सामग्री देने और अतिरिक्त कार्यक्षमता प्रदान करने के लिए तृतीय-पक्ष सेवाओं का उपयोग कर सकते हैं।",
      points: [
        {
          title: "गूगल एनालिटिक्स",
          desc: "हम यह समझने के लिए गूगल एनालिटिक्स का उपयोग करते हैं कि आगंतुक हमारी साइट के साथ कैसे इंटरैक्ट करते हैं। इस डेटा संग्रह पर गूगल की गोपनीयता नीति लागू होती है।"
        },
        {
          title: "सोशल मीडिया प्लेटफॉर्म",
          desc: "हमारी साइट में सोशल मीडिया बटन और विजेट शामिल हो सकते हैं जो आपको सामग्री साझा करने की अनुमति देते हैं।"
        },
        {
          title: "विज्ञापन भागीदार",
          desc: "हम प्रासंगिक विज्ञापन प्रदर्शित करने के लिए विज्ञापन भागीदारों के साथ काम कर सकते हैं। इन भागीदारों की अपनी गोपनीयता नीतियां हैं।"
        }
      ]
    },
    {
      id: "data-sharing",
      icon: <Share2 className="w-6 h-6" />,
      title: "6. जानकारी साझा करना",
      points: [
        {
          title: "सेवा प्रदाता",
          desc: "हम विश्वसनीय तृतीय-पक्ष विक्रेताओं के साथ डेटा साझा करते हैं जो वेबसाइट होस्टिंग, रखरखाव, एनालिटिक्स और ग्राहक सेवा में सहायता करते हैं।"
        },
        {
          title: "कानूनी आवश्यकताएं",
          desc: "जब कानून, विनियमन, कानूनी प्रक्रिया या सरकारी अनुरोध द्वारा आवश्यक हो"
        },
        {
          title: "व्यापार हस्तांतरण",
          desc: "किसी विलय, कंपनी संपत्ति की बिक्री, वित्तपोषण या अधिग्रहण के संबंध में"
        }
      ],
      note: "हम आपकी व्यक्तिगत जानकारी तृतीय पक्षों को नहीं बेचते हैं।"
    },
    {
      id: "data-security",
      icon: <Lock className="w-6 h-6" />,
      title: "7. डेटा सुरक्षा",
      content: "हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उचित तकनीकी और संगठनात्मक सुरक्षा उपाय लागू करते हैं।",
      points: [
        "डेटा ट्रांसमिशन के लिए 256-बिट SSL/TLS एन्क्रिप्शन",
        "नियमित सुरक्षा ऑडिट और भेद्यता मूल्यांकन",
        "सख्त पहुंच नियंत्रण और प्रमाणीकरण प्रोटोकॉल",
        "24/7 निगरानी के साथ सुरक्षित डेटा केंद्र",
        "नियमित बैकअप और आपदा पुनर्प्राप्ति प्रक्रियाएं"
      ],
      note: "हालांकि, इंटरनेट पर ट्रांसमिशन का कोई भी तरीका 100% सुरक्षित नहीं है। हम पूर्ण सुरक्षा की गारंटी नहीं दे सकते।"
    },
    {
      id: "your-rights",
      icon: <Users className="w-6 h-6" />,
      title: "8. आपके अधिकार",
      points: [
        {
          icon: <Eye className="w-4 h-4" />,
          title: "पहुंच",
          desc: "अपने व्यक्तिगत डेटा तक पहुंच का अनुरोध करें"
        },
        {
          icon: <Settings className="w-4 h-4" />,
          title: "सुधार",
          desc: "गलत या अधूरे डेटा को सही करें"
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          title: "मिटाना",
          desc: "अपने डेटा को हटाने का अनुरोध करें"
        },
        {
          icon: <XCircle className="w-4 h-4" />,
          title: "प्रतिबंध",
          desc: "अपने डेटा के प्रसंस्करण को प्रतिबंधित करें"
        },
        {
          icon: <Download className="w-4 h-4" />,
          title: "पोर्टेबिलिटी",
          desc: "अपना डेटा पोर्टेबल प्रारूप में प्राप्त करें"
        },
        {
          icon: <XCircle className="w-4 h-4" />,
          title: "आपत्ति",
          desc: "अपने डेटा के हमारे उपयोग पर आपत्ति करें"
        }
      ]
    },
    {
      id: "children",
      icon: <Users className="w-6 h-6" />,
      title: "9. बच्चों की गोपनीयता",
      content: "एंटरटेनइंडिया 13 वर्ष से कम उम्र के बच्चों के लिए निर्देशित नहीं है। हम जानबूझकर बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं। यदि आपको लगता है कि किसी बच्चे ने हमें व्यक्तिगत जानकारी प्रदान की है, तो कृपया तुरंत हमसे संपर्क करें।"
    },
    {
      id: "policy-changes",
      icon: <FileText className="w-6 h-6" />,
      title: "10. इस नीति में परिवर्तन",
      content: "हम अपनी प्रथाओं, प्रौद्योगिकियों, कानूनी आवश्यकताओं या अन्य कारकों में परिवर्तनों को दर्शाने के लिए समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। हम संशोधित 'अंतिम अद्यतन' तिथि के साथ इस पृष्ठ पर अद्यतन नीति पोस्ट करके भौतिक परिवर्तनों के बारे में आपको सूचित करेंगे।"
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6" />,
      title: "11. हमसे संपर्क करें",
      content: "यदि इस गोपनीयता नीति या हमारी डेटा प्रथाओं के बारे में आपके कोई प्रश्न, चिंताएं या अनुरोध हैं:",
      contact: {
        email: "privacy@entertainindia.com",
        website: "www.entertainindia.com",
        address: "मुंबई, महाराष्ट्र, भारत"
      }
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
              <Shield className="w-10 h-10 sm:w-12 sm:h-12" />
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                गोपनीयता <span className="text-yellow-300">नीति</span>
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-pink-100 max-w-3xl mx-auto mb-6 px-4">
              आपकी गोपनीयता हमारे लिए महत्वपूर्ण है
            </p>
            <p className="text-base sm:text-lg text-pink-100/90 max-w-2xl mx-auto px-4">
              जानें कि हम आपकी व्यक्तिगत जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">अंतिम अद्यतन: {currentDate}</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">जीडीपीआर अनुपालन</span>
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

      {/* Cookie Consent Banner (if not accepted) */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  हम आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं। इस साइट पर जारी रखते हुए, आप हमारी कुकीज़ के उपयोग से सहमत होते हैं।
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCookieConsent(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  स्वीकार करें
                </button>
                <Link
                  href="#cookies"
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  और जानें
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {section.icon}
                <span>{section.title.split(' ')[1]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Quick Summary Card */}
        <div className="mb-12 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-pink-900 dark:text-pink-200 mb-2">त्वरित सारांश</h2>
              <p className="text-pink-800 dark:text-pink-300">
                हम बेहतर सेवाएं प्रदान करने के लिए जानकारी एकत्र करते हैं। हम आपका व्यक्तिगत डेटा कभी नहीं बेचते हैं।
                आपकी जानकारी पर आपका नियंत्रण है। पूरी जानकारी के लिए पूरी नीति पढ़ें।
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section 
              key={section.id} 
              id={section.id}
              className="scroll-mt-20 group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-600 dark:text-pink-400">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              
              {/* Section Content */}
              <div className="p-6 pt-4">
                {section.content && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {section.content}
                  </p>
                )}
                
                {section.points && (
                  <div className="space-y-4">
                    {section.points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {point.icon ? (
                          <div className="p-1 bg-pink-50 dark:bg-pink-900/20 rounded text-pink-600 dark:text-pink-400 mt-0.5">
                            {point.icon}
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                        )}
                        {typeof point === 'string' ? (
                          <p className="text-gray-600 dark:text-gray-300">{point}</p>
                        ) : (
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {point.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {point.desc}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {section.note && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>नोट:</strong> {section.note}
                    </p>
                  </div>
                )}
                
                {section.contact && (
                  <div className="mt-4 space-y-3">
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-pink-500" />
                      <a href={`mailto:${section.contact.email}`} className="hover:text-pink-600 dark:hover:text-pink-400">
                        {section.contact.email}
                      </a>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Globe className="w-4 h-4 text-pink-500" />
                      <a 
                        href={`https://${section.contact.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1"
                      >
                        {section.contact.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Users className="w-4 h-4 text-pink-500" />
                      <span>{section.contact.address}</span>
                    </p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Data Rights Summary */}
        <div className="mt-12 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-8 border border-pink-200 dark:border-pink-800">
          <div className="text-center max-w-3xl mx-auto">
            <Shield className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              आपका डेटा, आपके अधिकार
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              हम पारदर्शिता में विश्वास करते हैं और आपको अपनी व्यक्तिगत जानकारी पर नियंत्रण देते हैं।
              आप किसी भी समय हमसे संपर्क करके अपने अधिकारों का प्रयोग कर सकते हैं।
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[
                "डेटा तक पहुंच",
                "जानकारी सुधारें",
                "खाता हटाएं",
                "डेटा निर्यात",
                "मार्केटिंग से बाहर",
                "सहमति वापस लें"
              ].map((right, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{right}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <Mail className="w-5 h-5" />
            सवाल? हमारी गोपनीयता टीम से संपर्क करें
          </Link>
        </div>
      </div>
    </div>
  );
}