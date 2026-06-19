"use client"
import { 
  Film, 
  Music, 
  Tv, 
  Globe, 
  Users, 
  Star, 
  Award,
  Calendar,
  Mail,
  Heart,
  Target,
  Eye,
  TrendingUp,
  PlayCircle,
  Sparkles,
  ChevronRight,
  Quote,
  Sparkle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const stats = [
    { icon: <Calendar className="w-6 h-6" />, value: "2025", label: "स्थापना" },
    { icon: <Users className="w-6 h-6" />, value: "50K+", label: "दैनिक पाठक" },
    { icon: <Film className="w-6 h-6" />, value: "1000+", label: "समीक्षाएं प्रकाशित" },
    { icon: <Users className="w-6 h-6" />, value: "15+", label: "लेखक समुदाय" }
  ];

  const coverageAreas = [
    {
      icon: <Film className="w-6 h-6" />,
      title: "बॉलीवुड",
      description: "फिल्म रिलीज, सेलिब्रिटी अपडेट, बॉक्स ऑफिस रिपोर्ट, एक्सक्लूसिव इंटरव्यू और बिहाइंड-द-सीन कवरेज।",
      color: "from-orange-500 to-pink-500",
      slug:"bollywood"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "हॉलीवुड",
      description: "ग्लोबल सिनेमा न्यूज, अवॉर्ड सीजन कवरेज, अंतर्राष्ट्रीय फिल्म फेस्टिवल और इंडस्ट्री हाइलाइट्स।",
      color: "from-pink-500 to-rose-500",
      slug:"hollywood"
    },
    {
      icon: <PlayCircle className="w-6 h-6" />,
      title: "ओटीटी प्लेटफॉर्म",
      description: "वेब सीरीज इनसाइट्स, स्ट्रीमिंग ट्रेंड्स, प्लेटफॉर्म कम्पेरिजन और डिजिटल कंटेंट एनालिसिस।",
      color: "from-purple-500 to-pink-500",
      slug:"ott"
    },
    {
      icon: <Tv className="w-6 h-6" />,
      title: "टेलीविजन",
      description: "टीवी शो कवरेज, टीआरपी अपडेट, रियलिटी शो बज और डेली सोप एंटरटेनमेंट।",
      color: "from-pink-500 to-red-500",
      slug:"tv"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "वेब स्टोरीज",
      description: "ट्रेंडिंग एंटरटेनमेंट टॉपिक्स, सेलिब्रिटी न्यूज और क्विक अपडेट पर शॉर्ट, इंगेजिंग स्टोरीज।",
      color: "from-pink-500 to-rose-500",
      slug:"web-stories"
    },
    {
      title:"सेलिब्रिटी प्रोफाइल",
      icon: <Star className="w-6 h-6" />,
      description: "इन-डेप्थ प्रोफाइल, करियर रेट्रोस्पेक्टिव और आपके पसंदीदा सितारों के साथ एक्सक्लूसिव इंटरव्यू।",
      color: "from-pink-500 to-purple-500",
      slug:"celebrities"
    }
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "सटीकता पहले",
      description: "हम प्रकाशन से पहले हर खबर की पुष्टि करते हैं, आपको विश्वसनीय और भरोसेमंद जानकारी देते हैं।"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "निष्पक्ष रिपोर्टिंग",
      description: "हमारी समीक्षाएं और न्यूज कवरेज स्वतंत्र और बाहरी प्रभाव से मुक्त रहते हैं।"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "ट्रेंडिंग नाउ",
      description: "हम एंटरटेनमेंट की नब्ज पर हाथ रखते हैं, आपको पहले लेटेस्ट अपडेट देते हैं।"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "मनोरंजन के प्रति जुनून",
      description: "हम पहले एंटरटेनमेंट के शौकीन हैं, फिर जर्नलिस्ट - हम जो कवर करते हैं उससे प्यार करते हैं।"
    }
  ];

  const teamMembers = [
    {
      name: "अनिल कुमार राठौर",
      role: "संस्थापक",
      bio: "EntertainIndia के पीछे के रणनीतिक वास्तुकार अनिल हैं। अनिल एक दूरदर्शी उद्यमी हैं, जो बड़े पैमाने पर विस्तार योग्य डिजिटल इकोसिस्टम बनाने के लिए समर्पित हैं। उनका नेतृत्व दीर्घकालिक विकास, ब्रांड की विश्वसनीयता और मीडिया क्षेत्र के भीतर नवाचार की संस्कृति को बढ़ावा देने पर केंद्रित है।",
      image: " "
    },
    {
      name: "अर्जित कुमार",
      role: "प्रोडक्ट मैनेजर, SEO विशेषज्ञ",
      bio: "टेक्निकल SEO और डिजिटल प्रोडक्ट लाइफ़साइकल मैनेजमेंट के विशेषज्ञ। अरजीत यह सुनिश्चित करते हैं कि EntertainIndia सर्च इंजन विज़िबिलिटी और परफ़ॉर्मेंस में सबसे आगे रहे। उनकी विशेषज्ञता जटिल एल्गोरिदम बदलावों को समझने और बेहतरीन कार्यक्षमता के लिए प्लेटफ़ॉर्म आर्किटेक्चर को ऑप्टिमाइज़ करने में है।",
      image: ""
    },
    {
      name: "चिराग पांडे",
      role: "मुख्य संपादक",
      bio: "कंटेंट की गुणवत्ता और पत्रकारिता के मानकों के संरक्षक। संपादकीय प्रबंधन में अपने गहन अनुभव के साथ, चिराग कंटेंट पाइपलाइन की देखरेख करते हैं—यह सुनिश्चित करते हुए कि हर कहानी सटीक और दिलचस्प हो, और हमारे विविध दर्शकों के साथ जुड़ाव महसूस कराए।",
      image: " "
    },
    {
      name: "कैफ़ अंसारी",
      role: "सोशल मीडिया विशेषज्ञ",
      bio: "एक गतिशील रणनीतिकार, जो कम्युनिटी एंगेजमेंट और ब्रांड की पहुँच बढ़ाने पर केंद्रित है। कैफ़ EntertainIndia की पहुँच को सभी प्रमुख सोशल प्लेटफ़ॉर्म पर विस्तार देने के लिए रीयल-टाइम ट्रेंड्स और डेटा एनालिटिक्स का उपयोग करता है, जिससे हमारे कंटेंट और वैश्विक दर्शकों के बीच की खाई को पाटा जा सके।",
      image: " "
    }
  ];

  const testimonials = [
    {
      quote: "एंटरटेनइंडिया मेरी ईमानदार समीक्षाओं के लिए गो-टू सोर्स बन गया है। उनका विश्लेषण हमेशा सटीक होता है!",
      author: "शिवम",
      role: "फिल्म प्रेमी"
    },
    {
      quote: "सबसे विश्वसनीय एंटरटेनमेंट न्यूज प्लेटफॉर्म। वे तथ्यों के साथ खबरें तोड़ते हैं, अफवाहों से नहीं।",
      author: "आदित्य",
      role: "कंटेंट क्रिएटर"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section - Fixed */}
      <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden min-h-[600px] flex items-center">
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
              <Film className="w-10 h-10 sm:w-12 sm:h-12" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                एंटरटेन<span className="text-yellow-300">इंडिया</span>
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-pink-100 max-w-3xl mx-auto mb-6 px-4">
              मनोरंजन समाचार, समीक्षा और अपडेट का आपका विश्वसनीय स्रोत
            </p>
            <p className="text-base sm:text-lg text-pink-100/90 max-w-2xl mx-auto px-4">
              बॉलीवुड से हॉलीवुड, ओटीटी से टेलीविजन, म्यूजिक से सेलिब्रिटी न्यूज तक — हम सटीकता, जुनून और ईमानदारी के साथ सब कवर करते हैं।
            </p>
            
            {/* Stats - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 w-full max-w-4xl px-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2 text-pink-200">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-pink-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider - Fixed positioning */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 120" className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="currentColor" 
              className="text-gray-50 dark:text-gray-900"
            />
          </svg>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full mb-6">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">हमारा मिशन</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              मनोरंजन को आपके और करीब लाना
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              हमारा लक्ष्य सटीक, समय पर और सार्थक मनोरंजन समाचार देना है। हम आपको सिनेमा, टेलीविजन, म्यूजिक और डिजिटल स्ट्रीमिंग के विश्वसनीय कवरेज से अवगत कराते हैं।
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              हम मानते हैं कि मनोरंजन सिर्फ गॉसिप से कहीं बढ़कर है — यह एक कला है जो गंभीर, विचारशील और ईमानदार पत्रकारिता की हकदार है।
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-8 text-white">
            <Quote className="w-12 h-12 text-white/50 mb-4" />
            <p className="text-xl italic mb-4">
              "मनोरंजन सिर्फ वह नहीं है जो हम कवर करते हैं — यह वह है जो हम हैं। हर कहानी जो हम बताते हैं, वह सच्चे जुनून से आती है।"
            </p>
            <p className="font-semibold">— अनिल कुमार राठौर, संस्थापक</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            हमें क्या प्रेरित करता है
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            हमारे मूल मूल्य हर चीज को आकार देते हैं, न्यूज गैदरिंग से लेकर कंटेंट क्रिएशन तक।
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What We Cover */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            हम क्या कवर करते हैं
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            सिल्वर स्क्रीन से आपके लिविंग रूम तक — हमने मनोरंजन को हर एंगल से कवर किया है।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverageAreas.map((area, index) => (
            <div key={index} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${area.color}`}></div>
              <div className="p-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                  {area.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{area.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{area.description}</p>
                <Link 
                  href={`/${area.slug}`}
                  className="inline-flex items-center gap-1 text-pink-600 dark:text-pink-400 text-sm font-medium hover:gap-2 transition-all"
                >
                  {area.title} एक्सप्लोर करें
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">हमारी टीम</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              एंटरटेनइंडिया की आवाजों से मिलिए
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              हम पत्रकारों, समीक्षकों और कंटेंट क्रिएटर्स का एक समर्पित समूह हैं जो विश्वसनीय और इंगेजिंग एंटरटेनमेंट कंटेंट देने के लिए प्रतिबद्ध हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-pink-600 dark:text-pink-400 text-sm font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          हमारे पाठक क्या कहते हैं
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
              <Quote className="w-8 h-8 text-pink-300 dark:text-pink-700 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">कोई कहानी शेयर करना चाहते हैं?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            हम हमेशा बेहतरीन कहानियों, फीडबैक और सहयोग के अवसरों की तलाश में रहते हैं।
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl"
          >
            <Mail className="w-5 h-5" />
            आज ही संपर्क करें
          </Link>
        </div>
      </div>
    </div>
  );
}