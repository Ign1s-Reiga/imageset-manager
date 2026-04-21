import Header from 'components/Header';
import { Alert, Autocomplete, Button, Divider, FormControl, LinearProgress, MenuItem, Select, Snackbar, TextField, Typography } from '@mui/material';
import { css } from '@emotion/react';
import Head from 'next/head';
import React, { useState } from 'react';
import { templateStyle, theme } from 'lib/theme';
import axios from 'axios';
import { postHeader } from 'pages/index';
import { WithId } from 'mongodb';
import { IAuthor, ICircle } from 'lib/mongodb';
import DivRowDirection from 'components/DivRowDirection';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';

type FormData = {
  title: string,
  releaseDate: Date | null,
  author: { name: string, id: string }[],
  circle: string,
  type: string
}

const buildCircleObject = (circleList: WithId<ICircle>[], circleId: string): { name: string, id: string } | undefined => {
  if (circleId === 'none') return undefined;
  const circle = circleList.find(v => v._id.toString() === circleId);
  return circle !== undefined ? { name: circle.name, id: circle._id.toString() } : undefined;
};

const Upload = ({ authorList, circleList }: { authorList: WithId<IAuthor>[], circleList: WithId<ICircle>[] }) => {
  const [upload7zState, setUpload7zState] = useState({ processing: false, disable: false, fileName: '' });
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState({ formError: false, uploadError: false, finished: false });
  const [data, setData] = useState<FormData>({ title: '', releaseDate: null, author: [], circle: 'none', type: 'Doujinshi' });

  const handleCloseSnackbar = (e?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway')
      return;
    setShowSnackbar({ formError: false, uploadError: false, finished: false });
  };

  const handleUploadImageSet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      setUpload7zState((prevState) => ({ ...prevState, processing: true }));
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('imageSet', file);

      await axios.post<{ result: string, fileName: string }>('/api/archive/upload', formData, {
        baseURL: 'http://localhost:3000', headers: { 'Content-Type': 'multipart/form-data', ...postHeader }
      }).then(({ data }) => {
        setUpload7zState({ processing: false, disable: true, fileName: data.fileName });
      }).catch(err => {
        setUpload7zState((prevState) => ({ ...prevState, processing: false }));
        setShowSnackbar((prevState) => ({ ...prevState, uploadError: true }));
        console.log(err);
      });
    }
  };

  const handleProcessUpload = () => {
    console.log(data.releaseDate);
    if (data.title !== '' && data.releaseDate !== null && data.author.length !== 0 && data.type !== '') {
      setUploadProcessing(true);
      axios.post('api/imagesets',
        {
          title: data.title,
          releaseDate: data.releaseDate,
          author: data.author,
          circle: buildCircleObject(circleList, data.circle),
          type: data.type,
          fileName: upload7zState.fileName
        }, { baseURL: 'http://localhost:3000', headers: { ...postHeader, 'Content-Type': 'application/json' }
        }).then(() => {
        setUploadProcessing(false);
        setUpload7zState((prevState) => ({ ...prevState, disable: false, fileName: '' }));
        setShowSnackbar((prevState) => ({ ...prevState, finished: true }));
      }).catch(() => {
        setUploadProcessing(false);
        setShowSnackbar((prevState) => ({ ...prevState, uploadError: true }));
      });
    } else
      setShowSnackbar((prevState) => ({ ...prevState, formError: true }));
  };

  const getCircleMenuItems = () => {
    const circleMenuItems = [<MenuItem key='none' value='none'>なし</MenuItem>];
    circleMenuItems.push(...circleList.map((circle) => <MenuItem key={ circle._id.toString() } value={ circle._id.toString() }>{ circle.name }</MenuItem>));
    return circleMenuItems;
  };

  const getAuthorOptions = () => {
    const options: { name: string, id: string }[] = [];
    authorList.forEach((author) => options.push({ name: author.name, id: author._id.toString() }));
    return options;
  };

  return (
    <>
      <Head>
        <title>Upload - ImageSet Manager</title>
      </Head>
      <Header/>
      <div css={ templateStyle.main }>
        <Typography variant='h3' css={ templateStyle.title }>アップロード</Typography>
        <div css={ templateStyle.container }>
          <Typography variant='h5' css={ css`border-bottom: ${theme.surface.dim} 1px solid; padding-left: 3rem; margin-bottom: 1.5rem; font-weight: 600` }>詳細入力</Typography>
          <div css={ templateStyle.form.box }>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>タイトル</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }> ：</Typography>
              <TextField
                variant='standard'
                error={ showSnackbar.formError && data.title === '' }
                value={ data.title }
                placeholder='タイトルを入力...'
                onChange={(e) => {
                  setData((prevState) => ({ ...prevState, title: e.target.value }));
                }}
                css={ css` display: flex; flex: 1; div { padding-left: 10px; } input::placeholder  { font-style: italic; }` }
              />
            </DivRowDirection>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>リリース日</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }> ：</Typography>
              <LocalizationProvider dateAdapter={ AdapterDateFns } adapterLocale={ja} dateFormats={{ monthAndYear: 'yyyy年 MMM' }}>
                <DatePicker
                  localeText={{
                    previousMonth: '前月',
                    nextMonth: '翌月',
                    okButtonLabel: '決定',
                    cancelButtonLabel: 'キャンセル',
                  }}
                  value={ data.releaseDate }
                  onChange={ (newValue) => setData(prevState => ({...prevState, releaseDate: newValue})) }
                  slotProps={{ textField: { variant: 'standard', sx: { display: 'flex', flex: 1, div: { pl: '10px' } } } }}
                />
              </LocalizationProvider>
            </DivRowDirection>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>作者</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }> ：</Typography>
              <Autocomplete
                options={ getAuthorOptions() }
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, v) => option.id === v.id }
                limitTags={7}
                css={ css` display: flex; flex: 1;` }
                value={ data.author }
                onChange={ (e, newValue) =>
                  setData(prevState => ({...prevState, author: newValue})) }
                multiple
                ChipProps={{ size: 'small' }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='standard'
                  />
                )}
              />
            </DivRowDirection>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>サークル</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }> ：</Typography>
              <Select
                variant='standard'
                css={ css` display: flex; flex: 1; div { padding-left: 10px; }` }
                value={ data.circle }
                onChange={ (e) => setData(prevState => ({ ...prevState, circle: e.target.value })) }
              >
                { getCircleMenuItems() }
              </Select>
            </DivRowDirection>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>タイプ</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }> ：</Typography>
              <Select
                variant='standard'
                value={ data.type }
                onChange={ (e) => setData(prevState => ({ ...prevState, type: e.target.value })) }
                error={ showSnackbar.formError && data.type === '' }
                css={ css` display: flex; flex: 1; div { padding-left: 10px; }` }
              >
                <MenuItem value='Doujinshi'>同人誌</MenuItem>
                <MenuItem value='CGImageSet'>CG・画像集</MenuItem>
                <MenuItem value='Manga'>マンガ</MenuItem>
                <MenuItem value='GameCG'>ゲームCG</MenuItem>
              </Select>
            </DivRowDirection>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>ファイル</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }> ：</Typography>
              <Typography css={ css`${templateStyle.form.label} display: flex; flex: 1;` }>{ upload7zState.fileName !== '' ? upload7zState.fileName : '未選択' }</Typography>
            </DivRowDirection>
          </div>
          <Divider css={ css`background-color: ${theme.surface.dim}` } flexItem variant='middle' sx={{ mb: '2rem', mt: '2.8rem' }}/>
          <div css={ css`padding: 0 25rem; display: flex; flex-direction: row; justify-content: space-between; * { width: 170px; }` }>
            <Button variant='contained' disableElevation component='label' disabled={ upload7zState.disable }>
              ファイルを選択 (7z)
              <input accept='.7z,application/x-7z-compressed' type='file' hidden onChange={handleUploadImageSet}/>
            </Button>
            <Button variant='contained' disableElevation onClick={ handleProcessUpload }>アップロード</Button>
          </div>
          {
            uploadProcessing || upload7zState.processing ?
              <label css={ css`margin: 2rem 3rem 0 3rem;` }>
                <Typography css={ css`margin-left: 1.5rem;` }>
                  { `${uploadProcessing ? 'アップロード中' : ''}${upload7zState.processing ? 'ファイルアップロード中' : ''}` }
                </Typography>
                <LinearProgress/>
              </label> :
              ''
          }
        </div>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.formError } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='error' sx={{ width: '100%' }}>タイトル、作者、タイプは必須項目です。</Alert>
        </Snackbar>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.uploadError } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='error' sx={{ width: '100%' }}>ファイルをアップロードできませんでした。</Alert>
        </Snackbar>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.finished } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='success' sx={{ width: '100%' }}>登録が完了しました。</Alert>
        </Snackbar>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const authorList = await axios.get<WithId<IAuthor>[]>('/api/creator', { baseURL: 'http://127.0.0.1:3000', params: { type: 'author' } })
    .then((res) => res.data);
  const circleList = await axios.get<WithId<ICircle>[]>('/api/creator', { baseURL: 'http://127.0.0.1:3000', params: { type: 'circle' } })
    .then((res) => res.data);
  return { props: { authorList: authorList, circleList: circleList } };
}

export default Upload;
