import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider as JotaiProvider } from 'jotai';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <JotaiProvider>
      <Component {...pageProps} />
    </JotaiProvider>
  );
}

export default MyApp;
