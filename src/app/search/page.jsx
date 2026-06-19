import SearchPage from '../../page-components/SearchPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'Search | EntertainIndia',
  description: 'Search for entertainment news, articles, videos, and more on EntertainIndia.',
  keywords: 'search, find, entertainment search',
};

export const dynamic = 'force-dynamic';

export default function Search() {
  return (
    <LayoutWrapper>
      <h1 className="sr-only">Search Results</h1>
      <SearchPage />
    </LayoutWrapper>
  );
}


