// app/layout.jsx
import '../index.css';
import NextTopLoader from 'nextjs-toploader';

import { GoogleAnalytics } from '@next/third-parties/google'
import StoreProvider from './providers/StoreProvider';
import ThemeProvider from './providers/ThemeProvider';
import LayoutWrapper from './LayoutWrapper';

import LoginModal from '../components/LoginModal';
export const metadata = {
  description: 'एंटरटेनइंडिया पर पाएं लेटेस्ट बॉलीवुड न्यूज़, हॉलीवुड अपडेट्स, ओटीटी बज़ और वायरल सेलिब्रिटी फोटोज।',
   verification: {
    google: 'vkgInbS-yamVctNRtvOX1vVoXpKA3O2ucFCgYSEqVrc',
  },
};

export default function RootLayout({ 
  children, 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
     <body>
    <NextTopLoader 
  color="#ec4899" // पिंक-500 (Tailwind pink-500)
  initialPosition={0.08}
  crawlSpeed={200}
  height={2.5}
  crawl={true}
  showSpinner={false}
  easing="ease"
  speed={200}
  shadow="0 0 5px rgba(236, 72, 153, 0.4), 0 0 2px rgba(236, 72, 153, 0.2)"
/>

  <ThemeProvider>
    <StoreProvider>
    
        {children}
     
      <LoginModal />
    </StoreProvider>
  </ThemeProvider>
</body>
<GoogleAnalytics gaId="G-KW3NK8YLXS" />
    </html>
  );
}