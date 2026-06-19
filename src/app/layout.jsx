// app/layout.jsx
import '../index.css';
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