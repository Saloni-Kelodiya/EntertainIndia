import AboutPage from '../../page-components/AboutPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'About EntertainIndia',
  description: 'Learn about EntertainIndia, your ultimate source for entertainment news, reviews, and updates from Bollywood, Hollywood, OTT, and more.',
  keywords: 'about entertainindia, entertainment news portal, entertainment website',
};

export default function About() {
  return (
    <LayoutWrapper>
      <AboutPage />
    </LayoutWrapper>
  );
}


