import Header from 'components/Header';
import Head from 'next/head';
import React, { useState } from 'react';
import { templateStyle, theme } from 'lib/theme';
import { Divider, MenuItem, Select, TextField, Typography, Button, Snackbar, Alert } from '@mui/material';
import { css } from '@emotion/react';
import DivRowDirection from 'components/DivRowDirection';
import axios from 'axios';
import { postHeader } from 'pages/index';

/**
 * 作者・サークル登録用ページ
 * 現時点でタグはObjectIdで管理していないが
 * タグの混乱を防ぐためにもObjectIdで管理しこのページから登録させるようにする可能性がある。
  */
const Register = () => {
  const [data, setData] = useState({ type: 'author', name: '' });
  const [showSnackbar, setShowSnackbar] = useState<{ error: boolean, saved: boolean }>({ error: false, saved: false });
  const [registerButton, setRegisterButton] = useState(false);

  const handleRegister = async () => {
    if (data.name === '')
      return;
    setRegisterButton(true);
    await axios.post('/api/creator', data.name, { baseURL: 'http://localhost:3000', params: { type: data.type }, headers: { 'Content-Type': 'text/plain', ...postHeader } })
      .then(() => {
        setRegisterButton(false);
        setShowSnackbar({ error: false, saved: true });
      }).catch(() => {
        setRegisterButton(false);
        setShowSnackbar({ error: true, saved: false });
      });
  };

  const handleCloseSnackbar = (e?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway')
      return;
    setShowSnackbar({ error: false, saved: false });
  };

  return (
    <>
      <Head>
        <title>Register - ImageSet Manager</title>
      </Head>
      <Header/>
      <div css={ templateStyle.main }>
        <Typography variant='h3' css={ templateStyle.title }>作者・サークルの登録</Typography>
        <div css={ templateStyle.container }>
          <Typography variant='h5' css={ css`border-bottom: ${theme.surface.dim} 1px solid; padding-left: 3rem; margin-bottom: 1.5rem; font-weight: 600` }>詳細入力</Typography>
          <div css={ templateStyle.form.box }>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>登録先</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }>：</Typography>
              <Select
                variant='standard'
                css={ css`display: flex; flex: 1; div { padding-left: 10px; }` }
                value={data.type}
                onChange={ (e) => setData(prevState =>  ({ ...prevState, type: e.target.value })) }
              >
                <MenuItem value={'author'}>作者</MenuItem>
                <MenuItem value={'circle'}>サークル</MenuItem>
              </Select>
            </DivRowDirection>
            <DivRowDirection>
              <Typography css={ css`${templateStyle.form.label} width: 8rem;` }>名前</Typography>
              <Typography css={ css`${templateStyle.form.label} margin-right: 0.8rem;` }>：</Typography>
              <TextField
                variant='standard'
                css={ css`display: flex; flex: 1; div { padding-left: 10px; } input::placeholder { font-style: italic; }` }
                value={data.name}
                onChange={ (e) => setData(prevState =>  ({ ...prevState, name: e.target.value })) }
                placeholder='名前を入力...'
              />
            </DivRowDirection>
          </div>
          <Divider css={ css`background-color: ${theme.surface.dim}` } flexItem variant='middle' sx={{ mb: '2rem', mt: '2.8rem' }}/>
          <Button
            css={ css`max-width: 175px; width: 175px; margin-right: 1rem; margin-left: auto;` }
            disableElevation
            onClick={ handleRegister }
            disabled={ registerButton }
            color='success'
            variant='contained'
          >
            登録
          </Button>
        </div>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.saved } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='success' sx={{ width: '100%' }}>
            登録しました。
          </Alert>
        </Snackbar>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.error } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='error' sx={{ width: '100%' }}>
            登録に失敗しました。
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};
export default Register;
