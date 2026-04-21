import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { IImageSet } from 'lib/mongodb';
import { WithId } from 'mongodb';
import { css } from '@emotion/react';
import { Select, Typography, MenuItem, SelectChangeEvent } from '@mui/material';
import { IBM_PLEX_SANS_JP, IBM_PLEX_SANS_JP_LIGHT } from 'pages/_app';
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import ArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import FullscreenIcon from '@mui/icons-material/FullscreenRounded';
import { useRouter } from 'next/router';
import { templateStyle } from 'lib/theme';
import Header from 'components/Header';
import Image from 'next/image';

const styles = {
  main: css`
    background-color: #262626;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  `,
  header: css`
    padding: 0.2rem 0;
    background-color: #2f2f2f;
    display: flex;
    flex-direction: row;
    height: min-content;
    justify-content: center;
    width: 100%;
  `,
  headertext: css`
    color: #c0c0c0;
    cursor: pointer;
    user-select: none;
    :hover {
      color: #dcdcdc
    }
  `
};

type ViewerProps = {
  name: string | null;
  id: string | null
  size: number; // ページ数
  fileList: string[];
}

const replacePageNumber = (num: number, length: number) => {
  let replaced = num.toString();
  if (replaced.length < length.toString().length)
    replaced = '0'.repeat(length.toString().length - num.toString().length) + num.toString();
  return replaced;
};

const Viewer = ({ name, id, size, fileList }: ViewerProps) => {
  const router = useRouter();
  const [count, setCount] = useState(1);

  // TODO: OnClickと OnKeyDownが競合している(優先度はOnClickのほうが高い)のでなんとかする。
  const handleKeyDownEvent = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'ArrowLeft') {
      console.log('left');
      if (count < size) {
        setCount((prevState) => prevState + 1);
        event.stopPropagation();
      }
    } else if (event.code === 'ArrowRight') {
      if (count < size) {
        setCount((prevState) => prevState - 1);
        event.stopPropagation();
      }
    }
  };

  const handleClickPageButton = (event:  React.MouseEvent<HTMLDivElement, MouseEvent>, type: 'next' | 'prev') => {
    if (type === 'next') {
      if (count < size) {
        setCount(prevState => prevState + 1);
        event.stopPropagation();
      }
    } else if (type === 'prev')
      if (count > 1)
        setCount(prevState => prevState - 1);
  };

  const handleClickFullscreenButton = () => {
    const imgElem = document.querySelector('img');
    if (document.fullscreenElement === null && document.fullscreenEnabled && imgElem !== null)
      imgElem.requestFullscreen();
    else
      document.exitFullscreen();
  };

  const handleChangePage = (event: SelectChangeEvent) => {
    setCount(Number(event.target.value));
  };

  const handleClickBackGallery = (imagesetid: string) => {
    router.push(imagesetid).then(() => {
      axios.get('/api/archive/deletetemp', { baseURL: 'http://127.0.0.1:3000' });
    });
  };

  const getMenuItemList = () => {
    const menuItemList = [];
    for (let i = 1; i < size + 1; i++)
      menuItemList.push(<MenuItem key={i} value={i}>{ `Page ${i}` }</MenuItem>);
    return menuItemList;
  };

  // TODO: Selectのpopoverの最大の高さを指定し縮める
  return (
    <>
      <Head>
        <title>{ `${name !== null ? name : 'Not Found' } - ImageSet Manager` }</title>
      </Head>
      {
        name !== null && id !== null && size > 0 ?
          <div css={ styles.main }>
            <div css={ styles.header }>
              <div css={ css`gap: 1.15rem; display: flex; flex-direction: row; align-items: center;` }>
                <Typography css={ css`${styles.headertext} font-size: 1.2rem; font-family: ${ IBM_PLEX_SANS_JP_LIGHT.style.fontFamily };` } onClick={ () => handleClickBackGallery(id) }>
                  Back to Gallery
                </Typography>
                <div css={ css`${styles.headertext} display: flex; align-items: center;` } onClick={ (e) => handleClickPageButton(e, 'next') }>
                  <ArrowLeftIcon/>
                  <Typography variant='h5' css={ css`font-size: 1rem; font-family: ${ IBM_PLEX_SANS_JP_LIGHT.style.fontFamily };` }>Next</Typography>
                </div>
                <div css={ css`${styles.headertext} display: flex; align-items: center;` } onClick={ (e) => handleClickPageButton(e, 'prev') }>
                  <Typography variant='h5' css={ css`font-size: 1rem; font-family: ${ IBM_PLEX_SANS_JP_LIGHT.style.fontFamily };` }>Prev</Typography>
                  <ArrowRightIcon/>
                </div>
                <div css={ css`${styles.headertext} display: flex; align-items: center;` } onClick={ handleClickFullscreenButton }>
                  <FullscreenIcon/>
                  <Typography variant='h5' css={ css`font-size: 1rem; font-family: ${ IBM_PLEX_SANS_JP_LIGHT.style.fontFamily };` }>Full screen</Typography>
                </div>
                <Select
                  css={ css`background-color: #dcdcdc; margin-left: 15rem; min-width: 10rem; div { padding: 5.5px 14px }` }
                  value={count.toString()}
                  defaultValue={'1'}
                  onChange={ handleChangePage }>
                  { getMenuItemList() }
                </Select>
              </div>
            </div>
            <div css={ css`justify-content: center; display: flex; flex: 1; max-height: calc(100% - 61.4px); max-width: 100%` } onKeyDown={ (e) => handleKeyDownEvent(e) }>
              <img
                src={ `/temp/${fileList[count - 1]}?${new Date().getTime()}` }
                css={ css`max-height: 100%; height: min-content; max-width: inherit;` }
                onClick={ (e) => handleClickPageButton(e, 'next') }
                alt={ `image: ${replacePageNumber(count, size)}.webp` }
                loading='eager'
              />
            </div>
          </div> :
          <div>
            <Header/>
            <div css={ templateStyle.main }>
              <div css={ templateStyle.container }>
                <Typography variant='body1' css={ css`font-size: 1.8rem; font-family: ${IBM_PLEX_SANS_JP.style.fontFamily}, sans-serif; font-weight: 700; margin: 12rem auto;` }>
                  { size < 1 ? '403 - Forbidden' : '404 - Page Not Found' }
                </Typography>
              </div>
            </div>
          </div>
      }
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  let imageSetName: string | null = null;
  let size: number = 0;
  let fileList: string[] = [];
  if (typeof id === 'string') {
    await axios.get<WithId<IImageSet>>('/api/imagesets', { baseURL: 'http://127.0.0.1:3000', params: { id: id } })
      .then((res) => imageSetName = res.data.name);
    await axios.get<{ size: number, fileList: string[] }>('/api/archive/getimage', { baseURL: 'http://127.0.0.1:3000' })
      .then((res) => {
        size = res.data.size;
        fileList = res.data.fileList;
      });
  }

  return {
    props: { name: imageSetName, id: typeof id === 'string' ? id : null, size: size, fileList: fileList }
  };
}

export default Viewer;
