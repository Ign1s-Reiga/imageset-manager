import Head from 'next/head';
import { css } from '@emotion/react';
import { theme } from 'lib/theme';
import Header from 'components/Header';
import ImageSetCard from 'components/ImageSetCard';
import React from 'react';
import axios from 'axios';
import { ObjectId, WithId } from 'mongodb';
import { IAuthor, ICircle } from 'lib/mongodb';
import { IRplRecent } from 'pages/api/recent';
import { Typography } from '@mui/material';
import { IBM_PLEX_SANS_JP } from 'pages/_app';
import SidebarRecentBox from 'components/SidebarRecentBox';

export type IRplImageSet = { // Rpl: Replaced, IReplacedImageSet ObjectId(_id以外)を持つプロパティにstringのプロパティを追加したもの
  _id: ObjectId;
  name: string;
  releaseDate: Date
  author: WithId<IAuthor>[];
  circle: WithId<ICircle> | undefined;
  tags: string[];
  type: 'Doujinshi' | 'CGImageSet' | 'Manga' | 'GameCG';
  isFavorited: boolean;
}

type Props = {
  imagesets: IRplImageSet[];
  recentViewed: IRplRecent[];
  recentUploaded: IRplRecent[];
}

// POSTリクエストのヘッダー 全部ワイルドカード。
export const postHeader = {
  'Content-Language': '*',
  'Accept-Language': '*',
  'Accept': '*/*',
};

const styles = {
  sidebar: {
    main: css`
      background-color: ${theme.surface.container.low};
      border-radius: 8px;
      width: 17.2rem;
      margin: 4rem 3.2rem 0 2rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      height: min-content;
    `,
    title: css`
      font-family: ${IBM_PLEX_SANS_JP.style.fontFamily};
      font-weight: ${IBM_PLEX_SANS_JP.style.fontWeight};
      font-size: 1.2rem;
      border-bottom: ${theme.surface.dim} 1px solid;
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

const Index = ({ imagesets, recentViewed, recentUploaded }: Props) => {
  return (
    <div>
      <Head>
        <title>Home - ImageSet Manager</title>
      </Head>
      <Header/>
      <div css={ css`display: flex; flex-direction: row; height: 100%;` }>
        <div css={ styles.sidebar.main }>
          <Typography css={ styles.sidebar.title }>閲覧履歴</Typography>
          <div css={ css`display: flex; gap: 0.5rem; flex-direction: column; margin-bottom: 2.4rem;` }>
            {
              recentViewed.length === 0 ?
                <Typography css={ css`margin-left: 1rem;` }>まだありません</Typography> :
                recentViewed.map((v) => { return (<SidebarRecentBox key={ v._id.toString() } recent={ v }/>); })
            }
          </div>
          <Typography css={ styles.sidebar.title }>投稿履歴</Typography>
          <div css={ css`display: flex; gap: 0.5rem; flex-direction: column; margin-bottom: 2.4rem;` }>
            {
              recentUploaded.length === 0 ?
                <Typography css={ css`margin-left: 1rem;` }>まだありません</Typography> :
                recentUploaded.map((v) => { return (<SidebarRecentBox key={ v._id.toString() } recent={ v }/>); })
            }
          </div>
          <Typography css={ styles.sidebar.title }>編集履歴</Typography>
          <div css={ css`display: flex; gap: 0.5rem; flex-direction: column; margin-bottom: 3rem;` }>
            {
              recentUploaded.length === 0 ?
                <Typography css={ css`margin-left: 1rem;` }>まだありません</Typography> :
                recentUploaded.map((v) => { return (<SidebarRecentBox key={ v._id.toString() } recent={ v }/>); })
            }
          </div>
        </div>
        <div css={ styles.container.main }>
          { imagesets.map((v) => {
            return (
              <ImageSetCard
                key={ v._id.toString() }
                type='grid'
                id={ v._id.toString() }
                title={ v.name }
                author={ v.author }
                circle={ v.circle }
                tags={ v.tags }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const imagesets = await axios.get<IRplImageSet[]>('/api/imagesets', { baseURL: 'http://localhost:3000' })
    .then(({ data }) => { return data; });
  const recentViewed = await axios.get<IRplRecent[]>('/api/recent', { baseURL: 'http://localhost:3000', params: { type: 'rv' } })
    .then(({ data }) => { return data; });
  const recentUploaded = await axios.get<IRplRecent[]>('/api/recent', { baseURL: 'http://localhost:3000', params: { type: 'ru' } })
    .then(({ data }) => { return data; });

  return {
    props: { imagesets: imagesets, recentViewed: recentViewed, recentUploaded: recentUploaded }
  };
}

export default Index;
