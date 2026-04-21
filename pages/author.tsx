import Header from 'components/Header';
import Head from 'next/head';
import React from 'react';
import { GetServerSidePropsContext } from 'next';
import { IAuthor } from 'lib/mongodb';
import axios from 'axios';
import { templateStyle } from 'lib/theme';
import { Typography } from '@mui/material';
import { IRplImageSet } from 'pages/index';
import ImageSetCard from 'components/ImageSetCard';
import { css } from '@emotion/react';
import { IBM_PLEX_SANS_JP } from 'pages/_app';

// TODO: 削除、編集があっていいかもしれない。めんどくさくなったらMongoCompassでしよう、でいいかな。
// TODO: フィルター検索機能。ソート。
const Author = ({ author, imagesets }: { author: IAuthor | undefined, imagesets: IRplImageSet[] }) => {
  return (
    <>
      <Head>
        <title>{`${author !== undefined ? author.name : 'Not Found'} - ImageSet Manager`}</title>
      </Head>
      <Header/>
      {
        author !== undefined ?
          <div css={ templateStyle.main }>
            <Typography variant='h3' css={ templateStyle.title }>{ author.name }</Typography>
            <div css={ css`gap: 1.5em 2em; flex-wrap: wrap; flex-direction: row; justify-content: center; display: flex;` }>
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
              }) }
            </div>
          </div> :
          <div css={ templateStyle.container }>
            <Typography variant='body1' css={ css`font-size: 1.8rem; font-family: ${IBM_PLEX_SANS_JP.style.fontFamily}, sans-serif; font-weight: 700; margin: 12rem auto;` }>
              404 - Page Not Found
            </Typography>
          </div>
      }
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const imagesets = await axios.get<IRplImageSet[]>('/api/imagesets', { baseURL: 'http://localhost:3000' })
    .then((res) => res.data.filter((v) => {
      let contains = false;
      for (const author of v.author)
        if (author._id.toString() === id) {
          contains = true;
          break;
        }
      return contains;
    }));
  const targetAuthor = imagesets[0].author.find((v) => v._id.toString() === id);

  return {
    props: { author: targetAuthor, imagesets: imagesets }
  };
}
export default Author;

