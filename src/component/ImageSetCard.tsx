import { Box, Card, Tooltip, Typography } from '@mui/material';
import { theme } from 'lib/theme';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import React from 'react';
import { IAuthor, ICircle } from 'lib/mongodb';

const styles = {
  card: css`
    background-color: ${theme.surface.container.low};
    border-radius: 6px;
    box-shadow: none;
    width: 320px;
    height: auto;
    padding: 1rem;
    cursor: pointer;
  `,
  title: css`
    font-size: 1.1rem;
    padding-bottom: 0.5rem;
    text-overflow: ellipsis;
    overflow-x: hidden;
    white-space: nowrap;
  `
};

type ImageSetCardProps = {
  type: 'grid' | 'list';
  id: string;
  title: string;
  author: IAuthor[];
  circle: ICircle | undefined;
  tags: string[];
}

const ImageSetCard = ({ type, id, title, author, circle, tags }: ImageSetCardProps) => {
  const router = useRouter();
  const buildAuthorsListStr = (authors: IAuthor[]) => {
    let str = '';
    authors.forEach((author, i) => {
      str += author.name;
      if (i !== authors.length - 1) str += ', ';
    });
    return str;
  };

  const handleClickISCard = (dest: string) => {
    router.push(dest);
  };

  // TODO: タグの表示, タグ表示はListのみのほうが見易さ的には良いかも。Gridの場合はタグをhoverで表示するとか。
  return (
    <Card css={ styles.card } onClick={ () => handleClickISCard(id) }>
      <Tooltip title={ title }>
        <Typography variant='h4' css={ styles.title }>{ title }</Typography>
      </Tooltip>
      <div css={ css`padding-bottom: 0.4rem;` }>
        <Typography variant='body1' css={ css`font-size: 0.9rem;` }>{`作者：${buildAuthorsListStr(author)}`}</Typography>
        <Typography variant='body1' css={ css`font-size: 0.9rem;` }>{`サークル：${circle?.name}`}</Typography>
      </div>
      <Box
        sx={{ bgcolor: theme.surface.container.high, height: '210px', width: '280px' }}
        css={ css`border-radius: 5px; justify-content: center; display: flex;` }
      >
        <img
          src={ `/thumbnail/${id}.webp` }
          alt=''
          css={ css`height: 210px; width: auto; border-radius: 5px;` }
          loading='eager'
        />
      </Box>
    </Card>
  );
};

export default ImageSetCard;
