import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { SOCIAL_LINKS } from '../../lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="p-6 inset-x-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-300 mt-16 border-t">
     <div className="container-custom py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* 🎬 About Section */}
        <div>
          <h3 className="text-white font-heading font-extrabold text-xl mb-4 flex items-center gap-2">
            🎬 Entertain<span className="text-pink-500">India</span>
          </h3>

          <p className="text-sm text-gray-400 leading-relaxed">
            बॉलीवुड, हॉलीवुड, OTT, म्यूज़िक और सेलिब्रिटी न्यूज़ से जुड़ी 
            ताज़ा एंटरटेनमेंट खबरों के लिए आपका भरोसेमंद प्लेटफॉर्म।
          </p>
        </div>

        {/* 🔗 Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-lg mb-4 border-l-4 border-pink-500 pl-2">
            त्वरित लिंक
          </h4>

          <ul className="space-y-2 text-sm">
            {[
              { name: "बॉलीवुड", slug: "bollywood" },
              { name: "हॉलीवुड", slug: "hollywood" },
              
            { name: 'टॉलीवुड', slug: 'tollywood' },
  { name: 'भोजीवुड', slug: 'bhojiwood',   },

            { name: "ओटीटी", slug: "ott" },
              
            ].map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  className="hover:text-pink-400 transition-colors flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block"></span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🏢 Company */}
        <div>
          <h4 className="text-white font-semibold text-lg mb-4 border-l-4 border-purple-500 pl-2">
            कंपनी
          </h4>

          <ul className="space-y-2 text-sm">
            {[
              { name: "हमारे बारे में", slug: "about" },
              { name: "संपर्क करें", slug: "contact" },
              { name: "सामान्य प्रश्न", slug: "faq" }, //  FAQ अब हिंदी में
              { name: "गोपनीयता नीति", slug: "privacy-policy" },
              { name: "अस्वीकरण", slug: "disclaimer" },
              { name: "नियम और शर्तें", slug: "terms-services" }
            ].map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  className="hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 📰 Newsletter */}
        <div>
          <h4 className="text-white font-semibold text-lg mb-4 border-l-4 border-blue-500 pl-2">
            न्यूज़लेटर
          </h4>

          <p className="text-sm text-gray-400 mb-4">
            ताज़ा एंटरटेनमेंट अपडेट्स सीधे अपने इनबॉक्स में पाने के लिए सब्सक्राइब करें।
          </p>

          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="अपना ईमेल दर्ज करें"
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm text-gray-200 placeholder:text-gray-500"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
            >
              सब्सक्राइब करें
            </button>
          </form>
        </div>

      </div>

      {/* 🌐 Social Media & Copyright */}
      <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

        <p className="text-sm text-gray-400">
          © {currentYear} <span className="text-white font-semibold">EntertainIndia</span>. सर्वाधिकार सुरक्षित।
        </p>

        <div className="flex items-center gap-5">

          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            हमें फॉलो करें
          </span>

          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-700 transition-all"
          >
            <Facebook className="w-5 h-5" />
          </a>

          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-sky-400 hover:bg-gray-700 transition-all"
          >
            <Twitter className="w-5 h-5" />
          </a>

          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-pink-500 hover:bg-gray-700 transition-all"
          >
            <Instagram className="w-5 h-5" />
          </a>

          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-700 transition-all"
          >
            <Youtube className="w-5 h-5" />
          </a>

        </div>
      </div>
</div>
    </footer>
  );
}