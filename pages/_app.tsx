import { AppProps } from 'next/app';
import { css } from '@emotion/react';
import { GlobalStyles } from '@mui/material';
import { IBM_Plex_Sans_JP, M_PLUS_2 } from 'next/font/google';

export const MPLUS2_bold = M_PLUS_2({
  weight: '700',
  display: 'swap',
  subsets: ['latin']
});
export const MPLUS2_regular = M_PLUS_2({
  weight: '500',
  display: 'swap',
  subsets: ['latin']
});
export const IBM_PLEX_SANS_JP = IBM_Plex_Sans_JP({
  weight: '600',
  display: 'swap',
  subsets: ['latin']
});
export const IBM_PLEX_SANS_JP_LIGHT = IBM_Plex_Sans_JP({
  weight: '200',
  display: 'swap',
  subsets: ['latin']
});

const globalStyles = css`
  body {
    margin: 0;
    background-color: #f3f5eb;
    max-width: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }
`;

const App = ({ Component, pageProps: { ...pageProps } }: AppProps) => {
  // FIXME: <Component/> のJSX型エラー => nextjsとその他のパッケージの依存関係が競合しているため、型エラーを起こしているものと思われる。一か月くらい待ったら直ってるでしょこれ。
  return (
    <>
      <GlobalStyles styles={globalStyles} />
      <Component {...pageProps} />
    </>
  );
};

export default App;
