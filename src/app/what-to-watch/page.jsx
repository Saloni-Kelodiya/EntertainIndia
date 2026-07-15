import { articlesAPI } from '../../lib/api/articles';
import WhatToWatchClient from '../../page-components/WhatToWatch';
import LayoutWrapper from '../LayoutWrapper';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  // ... (आपका मौजूदा मेटाडेटा)
}

export default async function क्या_देखें_मूल_पेज() {
  try {
    // 1️⃣ सिर्फ articles fetch करें – अब genres भी आएँगे
    const लेख_प्रतिक्रिया = await articlesAPI.getWhattoWatch({
      pageSize: 200,
      hasPlatform: true, // सिर्फ वही जिनमें watching_platform हो
      sort: 'publish_datetime:desc', // (या 'createdAt:desc')
    });

    const लेख = लेख_प्रतिक्रिया?.articles || [];

    // 2️⃣ सारे प्लेटफॉर्म निकालें (distinct)
    const सभी_प्लेटफॉर्म = new Set();
    लेख.forEach(a => {
      if (a.watching_platform && Array.isArray(a.watching_platform)) {
        a.watching_platform.forEach(p => सभी_प्लेटफॉर्म.add(p));
      }
    });
    const प्लेटफॉर्म_लिस्ट = Array.from(सभी_प्लेटफॉर्म).filter(Boolean).sort();

    // 3️⃣ सारे जेनर निकालें (distinct) – सिर्फ slug
    const सभी_जेनर = new Map();
    लेख.forEach(a => {
      if (a.genres && Array.isArray(a.genres)) {
        a.genres.forEach(g => {
          if (g.slug && !सभी_जेनर.has(g.slug)) {
            सभी_जेनर.set(g.slug, g.name || g.slug);
          }
        });
      }
    });
    const जेनर_लिस्ट = Array.from(सभी_जेनर.entries()).map(([slug, name]) => ({ slug, name }));

    // 4️⃣ फ़ॉलबैक – अगर कोई डेटा न हो
    const फ़ॉलबैक_प्लेटफॉर्म = ['Netflix', 'Amazon Prime', 'Disney+ Hotstar', 'SonyLIV', 'ZEE5'];
    const अंतिम_प्लेटफॉर्म = प्लेटफॉर्म_लिस्ट.length > 0 ? प्लेटफॉर्म_लिस्ट : फ़ॉलबैक_प्लेटफॉर्म;
    const अंतिम_जेनर = जेनर_लिस्ट.length > 0 ? जेनर_लिस्ट : [];

    // 5️⃣ स्कीमा JSON-LD (बाकी आपका पुराना कोड)
    const जेसन_एलडी = { /* ... */ };
    const ब्रेडक्रंब_एलडी = { /* ... */ };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(जेसन_एलडी) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ब्रेडक्रंब_एलडी) }} />

        <LayoutWrapper>
          <h1 className="sr-only">क्या देखें: बेस्ट मूवीज और वेब सीरीज सुझाव</h1>
          <WhatToWatchClient
            initialArticles={लेख}
            initialGenres={अंतिम_जेनर}          // ← यहाँ से आएँगे
            initialPlatforms={अंतिम_प्लेटफॉर्म} // ← यहाँ से आएँगे
            serverCategory="सभी"
            serverPlatform="all"
          />
        </LayoutWrapper>
      </>
    );
  } catch (त्रुटि) {
    console.error("❌ क्या-देखें डेटा लाने में त्रुटि:", त्रुटि);
    return (
      <LayoutWrapper>
        <WhatToWatchClient
          key="सभी-श्रेणियां"
          initialArticles={[]}
          initialGenres={[]}
          initialPlatforms={['Netflix', 'Amazon Prime', 'Disney+ Hotstar']}
          serverCategory="सभी"
          serverPlatform="सभी"
        />
      </LayoutWrapper>
    );
  }
}