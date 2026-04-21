import { css } from '@emotion/react';
import { IBM_Plex_Sans_JP, M_PLUS_2 } from 'next/font/google';

export const ibmPlexSansJP = IBM_Plex_Sans_JP({
  weight: ['200', '600'],
  display: 'swap',
  subsets: ['latin']
});
export const MPLUS2_regular = M_PLUS_2({
  weight: ['500', '700'],
  display: 'swap',
  subsets: ['latin']
});

export const theme = {
  surface: {
    main: '#f3f5eb',
    dim: '#afafaa',
    container: {
      low: '#e8eae0',
      normal: '#ececec', // unused
      high: '#dcded3',
      highest: '#e1e3da', // unused
    }
  }
};

export const templateStyle = {
  main: css`
    padding: 2rem 1.2rem 0 1.2rem;
  `,
  title: css`
    font-family: ${MPLUS2_bold.style.fontFamily}, sans-serif;
    font-weight: 700;
    border-bottom: ${theme.surface.dim} 1px solid;
    padding-left: 1.2rem;
    margin-bottom: 2.3rem;
  `,
  container: css`
    display: flex;
    flex-direction: column;
    margin: 0 1.2rem;
    padding: 1.6rem 1.3rem;
    border-radius: 8px;
    background-color: #e8eae0;
  `,
  form: {
    box: css`
      display: flex;
      flex-direction: column;
      margin: 0 9rem;
      gap: 1.1rem;
    `,
    label: css`
      font-size: 1.2rem;
      font-family: ${IBM_PLEX_SANS_JP.style.fontFamily};
      white-space: nowrap;
    `
  },
};
