import AboutPage from '../../page-components/AboutPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'हमारे बारे में | EntertainIndia - मनोरंजन समाचार और अपडेट्स',
  description:
    'Learn about EntertainIndia, your ultimate source for entertainment news, reviews, and updates from Bollywood, Hollywood, OTT, and more.',
  keywords:
    'about entertainindia, entertainment news portal, entertainment website',

  alternates: {
    canonical: 'https://entertainindia.in/about',
  },
};



export default function About() {
  return (
    <LayoutWrapper>
      <AboutPage />
    </LayoutWrapper>
  );
}


