import { css } from '@emotion/react';
import { Box, Button, Typography } from '@mui/material';
import { theme } from 'lib/theme';
import React, { useState } from 'react';
import { MPLUS2_bold } from 'pages/_app';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ObjectId, WithId } from 'mongodb';
import { IAuthor, ICircle } from 'lib/mongodb';
import { postHeader } from 'pages';

const styles = {
  descbox: css`
    display: flex;
    flex-direction: row;
    gap: 2.5rem;
    margin: 0 2rem 0 2rem;
  `,
  profile: css`
    display: flex;
    flex: 1;
    margin: 0.6rem 0 1.6rem 0;
    padding: 0.4rem 1.1rem;
    background-color: ${theme.surface.container.high};
    border-radius: 5px;

    p {
      font-size: 1.2rem;
      font-family: ${MPLUS2_bold.style.fontFamily}, sans-serif;
      color: #4f5760;
    }
  `,
  link: css`
    :hover {
      cursor: pointer;
      color: #707279;
      text-decoration: underline 1px solid #4f5760
    }
  `,
  buttonbox: css`
    margin: 0 1rem;
    gap: 0.6rem;
    display: flex;
    flex-direction: column;
  `
};

type UnzipApiRsp = {
  exists: boolean; // true => アーカイブが存在する, false => アーカイブが存在しない
  result: boolean; // true => 成功, false => 失敗
};

type Props = {
  id: ObjectId;
  releaseDate: '';
  author: WithId<IAuthor>[];
  circle: WithId<ICircle> | undefined;
  tags: string[];
  type: 'Doujinshi' | 'CGImageSet' | 'Manga' | 'GameCG';
}

export const replaceTypeString = (imageSetType: string): string => {
  switch (imageSetType) {
  case 'Doujinshi':
    return '同人誌';
  case 'Manga':
    return 'マンガ';
  case 'CGImageSet':
    return 'CG・画像集';
  case 'GameCG':
    return 'ゲームCG';
  default:
    return 'その他';
  }
};

const ArchiveDescBox = ({ id, author, circle, tags, type }: Props) => {
  const router = useRouter();
  const [isExtracted, setExtracted] = useState(false);

  const handleClickCreatorLink = (type: 'author' | 'circle', id: string) => {
    router.push({ pathname: type, query: { id: id } });
  };

  const handleClickExtract = () => {
    axios.get<UnzipApiRsp>('/api/archive/unzip', { baseURL: 'http://127.0.0.1:3000', params: { id: id.toString() }, headers: { 'Access-Control-Allow-Origin': '*' }})
      .then(({ data }) => {
        if (data.result)
          setExtracted(true);
      }).catch((err) => console.log(err));
  };

  const handleClickView = () => {
    router.push({ pathname: '/viewer', query: { id: id.toString() }})
      .then(() => setExtracted(false));
  };

  const getAuthorLinkList = (authorList: WithId<IAuthor>[]) => {
    const list = [];
    for (let i = 0; i < authorList.length; i++) {
      list.push(
        <Typography key={ authorList[i]._id.toString() } variant='body1' css={ styles.link } onClick={ () => handleClickCreatorLink('author', authorList[i]._id.toString()) }>
          { `${ author[i].name }${ i === authorList.length - 1 ? '' : ', ' }` }
        </Typography>
      );
    }
    return list;
  };

  return (
    <div css={ styles.descbox }>
      <div>
        <Box
          sx={{ bgcolor: theme.surface.container.high, height: '210px', width: '280px', mb: '0.8rem' }}
          css={ css`border-radius: 5px; justify-content: center; display: flex;` }
        >
          <img
            src={ `/thumbnail/${id.toString()}.webp` }
            alt=''
            css={ css`height: 210px; width: auto; border-radius: 5px;` }
            loading='eager'
          />
        </Box>
        <div css={ styles.buttonbox }>
          <Button variant='contained' disableElevation css={ css`padding: 2px 16px;` } disabled={ isExtracted } onClick={ handleClickExtract }>解凍</Button>
          <Button variant='contained' disableElevation css={ css`padding: 2px 16px;` } disabled={ !isExtracted } onClick={ handleClickView }>読む</Button>
        </div>
      </div>
      <div css={ styles.profile }>
        <div css={ css`width: 100px; min-width: 100px; gap: 0 0.5rem;` }>
          <Typography variant='body1'>Author</Typography>
          <Typography variant='body1'>Circle</Typography>
          <Typography variant='body1'>Type</Typography>
          <Typography variant='body1'>Tags</Typography>
        </div>
        <div css={ css`flex: 1; gap: 0 0.5rem;` }>
          <div css={ css`display: flex; flex-direction: row;` }>
            { getAuthorLinkList(author) }
          </div>
          {
            circle !== undefined ?
              <Typography variant='body1' css={ styles.link } onClick={ () => handleClickCreatorLink('circle', circle._id.toString()) }>{ circle.name }</Typography> :
              <Typography variant='body1'>N/A</Typography>
          }
          <Typography variant='body1'>{ replaceTypeString(type) }</Typography>
          <Typography variant='body1'>{tags }</Typography>
        </div>
      </div>
    </div>
  );
};
export default ArchiveDescBox;
