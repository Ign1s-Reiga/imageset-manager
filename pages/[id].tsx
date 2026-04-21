import Header from 'components/Header';
import Head from 'next/head';
import React, { useState } from 'react';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import { IRplImageSet } from 'pages/index';
import { templateStyle, theme } from 'lib/theme';
import { Autocomplete, Button, Drawer, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { css } from '@emotion/react';
import { IBM_PLEX_SANS_JP } from 'pages/_app';
import ArchiveDescBox from 'components/ArchiveDescBox';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import { IAuthor, ICircle } from 'lib/mongodb';
import { ObjectId, WithId } from 'mongodb';
import ArchiveEditDrawer from 'components/ArchiveEditDrawer';

const styles = {
  title: css`
    font-size: 1.3rem;
    font-family: ${IBM_PLEX_SANS_JP.style.fontFamily}, sans-serif;
    font-weight: 700;
  `,
  descbox: css`
    display: flex;
    flex-direction: row;
    gap: 2rem;
    margin-left: 2rem;
  `,
  profile: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    padding: 1.6rem 0;
    p {
      font-size: 1.1rem;
    }
  `,
  editmenu: {
    title: css`
      font-weight: 700;
      font-family: ${IBM_PLEX_SANS_JP.style.fontFamily};
      font-size: 2rem;
      padding-left: 1.2rem; 
      padding-bottom: -1rem;
      border-bottom: ${theme.surface.dim} solid 1px;
    `,
    paperProps: {
      backgroundColor: theme.surface.main,
      padding: '2.5rem',
      width: '18rem',
      maxWidth: '18rem',
      borderTopLeftRadius: '7px',
      borderBottomLeftRadius: '7px'
    },
    container: css`
      background-color: ${theme.surface.container.high};
      border-radius: 5px;
      padding: 1.2rem 1rem;
      gap: 0.7rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    `
  },
};

// TODO: 削除・編集機能をつける
const Archive = ({ imageset, authors, circles }: { imageset: IRplImageSet | null, authors: WithId<IAuthor>[], circles: WithId<ICircle>[] }) => {
  const [openEditMenu, setOpenEditMenu] = useState(false);
  const [imagesetData, setImagesetData] = useState<IRplImageSet | null>(imageset);

  const getCircleMenuItems = () => {
    const menuItems = [<MenuItem key='none' value='none'>なし</MenuItem>];
    menuItems.push(...circles.map((circle) => <MenuItem key={ circle._id.toString() } value={ circle._id.toString() }>{ circle.name }</MenuItem>));
    return menuItems;
  };

  return (
    <>
      <Head>
        <title>{`${ imageset !== null ? imageset.name : 'Not Found' } - ImageSet Manager`}</title>
      </Head>
      <Header/>
      <div css={ css`${templateStyle.main} z-index: auto;` }>
        {
          imageset !== null ?
            <div css={ templateStyle.container }>
              <div css={ css`display: flex; justify-content: flex-start; flex-direction: column;` }>
                <div css={ css`display: flex; flex-direction: row-reverse` }>
                  <IconButton css={ css`height: 40px;` } onClick={ () => setOpenEditMenu(true) }><EditIcon/></IconButton>
                  <Typography variant='body1' css={ css`${styles.title} margin-bottom: 2rem; flex: 1;` }>{ imageset.name }</Typography>
                </div>
                <ArchiveDescBox id={ imageset._id } releaseDate='' author={ imageset.author } circle={ imageset.circle } tags={ imageset.tags } type={ imageset.type }/>
              </div>
            </div> :
            <div css={ templateStyle.container }>
              <Typography variant='body1' css={ css`${styles.title} margin: 12rem auto;` }>404 - Page Not Found</Typography>
            </div>
        }
      </div>
      {
        imageset !== null ?
          <ArchiveEditDrawer
            imageset={ imageset }
            authors={ authors.map((v) => { return { id: v._id.toString(), name: v.name }; }) }
            circles={ circles.map((v) => { return { id: v._id.toString(), name: v.name }; }) }
            open={ openEditMenu }
            openFn={ setOpenEditMenu }
          /> : ''
      }
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const imageset = await axios.get<IRplImageSet | null>('/api/imagesets', {
    baseURL: 'http://localhost:3000', params: { id: id }
  }).then((res) => res.data);
  const authorList = await axios.get<WithId<IAuthor>[]>('/api/creator', { baseURL: 'http://localhost:3000', params: { type: 'author' } })
    .then((res) => res.data);
  const circleList = await axios.get<WithId<ICircle>[]>('/api/creator', { baseURL: 'http://localhost:3000', params: { type: 'circle' } })
    .then((res) => res.data);

  if (imageset !== null) {
    await axios.get('/api/archive/deletetemp', { baseURL: 'http://localhost:3000' });
    await axios.post('/api/recent', {
      id: imageset._id.toString(),
      name: imageset.name,
      author: imageset.author.map(i => { return { id: i._id.toString(), name: i.name }; }),
      circle: imageset.circle !== undefined ? { id: imageset.circle._id.toString(), name: imageset.circle.name } : undefined,
      type: imageset.type
    }, { baseURL: 'http://localhost:3000', params: { type: 'rv' }, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  return {
    props: { imageset: imageset, authors: authorList, circles: circleList  }
  };
}

export default Archive;
