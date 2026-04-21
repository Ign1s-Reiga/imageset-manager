import { IImageSet } from "@/util/mongodb";
import { Box, css, k } from "@kuma-ui/core";
import axios from "axios";

const styles = {
  sidebar: {
    main: css`
      background-color: var(--surface-container-low);
      border-radius: 8px;
      width: 17.2rem;
      margin: 4rem 3.2rem 0 2rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      height: min-content;
    `,
    title: css`
      font-weight: 600;
      font-size: 1.2rem;
      border-bottom: var(--surface-dim) 1px solid;
      padding: 0 0.8rem;
      margin-bottom: 0.6rem;
    `
  },
  container: {
    main: css`
      padding: 2.5rem 1.5rem 0 0;
      display: flex;
      flex: 1;
      gap: 1.5em 2em;
      flex-wrap: wrap;
      justify-content: center;
    `
  }
};

export default async function Home() {
  // TODO: Suspenseを使って、Loading状態を表示する。
  const imagesets = await axios.get<IImageSet[]>('/api/imagesets', { baseURL: 'http://localhost:3000' })
    .then(({ data }) => { return data; });
  const recentViewed = await axios.get<IImageSet[]>('/api/recent', { baseURL: 'http://localhost:3000', params: { type: 'rv' } })
    .then(({ data }) => { return data; });
  const recentUploaded = await axios.get<IImageSet[]>('/api/recent', { baseURL: 'http://localhost:3000', params: { type: 'ru' } })
    .then(({ data }) => { return data; });

  return (
    <>
      <title>Home - ImageSet Manager</title>
      <main display="flex" flexDirection="row" height="100%">
        <Box className={styles.sidebar.main}>
          <h1>TED</h1>
        </Box>
      </main>
    </>
  );
}
