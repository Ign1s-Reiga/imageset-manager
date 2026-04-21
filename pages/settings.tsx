import Header from 'components/Header';
import Head from 'next/head';
import React, { useState } from 'react';
import { Alert, Button, Divider, Snackbar, TextField, Typography } from '@mui/material';
import { css } from '@emotion/react';
import { templateStyle, theme } from 'lib/theme';
import axios from 'axios';
import { postHeader } from 'pages/index';
import { getConfig } from 'lib/utils';

const styles = {
  savebutton: css`
    max-width: 175px;
    width: 175px;
    margin-right: 1rem;
    margin-left: auto;
  `
};

const Settings = (initialSettings: { imagesetPath: string, maxSaveRecentViewed: number, maxSaveRecentUploaded: number }) => {
  const [saveButton, setSaveButton] = useState(false);
  const [showSnackbar, setShowSnackbar] =
    useState<{ error: boolean, saved: boolean }>({ error: false, saved: false });
  const [settings, setSettings] =
    useState({
      imagesetPath: initialSettings.imagesetPath,
      maxSaveRecentViewed: initialSettings.maxSaveRecentViewed,
      maxSaveRecentUploaded: initialSettings.maxSaveRecentUploaded
    });

  const handleChangeNumberTextField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: string) => {
    if (!Number.isInteger(Number(e.target.value)))
      return;
    setSettings(prevState => ({ ...prevState, [type]: Number(e.target.value) }));
  };

  const handleSaveSettings = () => {
    setSaveButton(false);
    axios.post('/api/settings', settings, { baseURL: 'http://127.0.0.1:3000', headers: { ...postHeader, 'Content-Type': 'application/json' } })
      .then(() => {
        setSaveButton(true);
        setShowSnackbar({ error: false, saved: true });
      }).catch(() => {
        setSaveButton(true);
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
        <title>Settings - ImageSet Manager</title>
      </Head>
      <Header/>
      <div css={ templateStyle.main }>
        <Typography variant='h3' css={ templateStyle.title }>設定</Typography>
        <div css={ css`${templateStyle.container} row-gap: 1.2rem;` }>
          <div css={ css`display: flex; flex-direction: row; gap: 1rem;` }>
            <Typography variant='h6'>ImageSet Dir Path:</Typography>
            <TextField
              value={ settings.imagesetPath }
              onChange={ (e) => setSettings(prevState => ({ ...prevState, imagesetPath: e.target.value })) }
              variant='standard'
              css={ css`display: flex; flex: 1; div { padding-left: 10px; }` }
            />
          </div>
          <div css={ css`display: flex; flex-direction: row; gap: 1rem;` }>
            <Typography variant='h6'>Max Save Recent Viewed History:</Typography>
            <TextField
              value={ settings.maxSaveRecentViewed }
              onChange={ (e) => handleChangeNumberTextField(e, 'maxSaveRecentViewed') }
              variant='standard'
              css={ css`display: flex; flex: 1; div { padding-left: 10px; }` }
            />
          </div>
          <div css={ css`display: flex; flex-direction: row; gap: 1rem;` }>
            <Typography variant='h6'>Max Save Recent Uploaded History:</Typography>
            <TextField
              value={ settings.maxSaveRecentUploaded }
              onChange={ (e) => handleChangeNumberTextField(e, 'maxSaveRecentUploaded') }
              variant='standard'
              css={ css`display: flex; flex: 1; div { padding-left: 10px; }` }
            />
          </div>
          <Divider css={ css`background-color: ${theme.surface.dim}` } flexItem variant='middle' sx={{ my: 3 }}/>
          <Button disableElevation color='success' variant='contained' css={ styles.savebutton } disabled={ saveButton } onClick={ handleSaveSettings }>保存</Button>
        </div>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.saved } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='success' sx={{ width: '100%' }}>
            設定を保存しました
          </Alert>
        </Snackbar>
        <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.error } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
          <Alert onClose={ handleCloseSnackbar } severity='error' sx={{ width: '100%' }}>
            設定の保存に失敗しました。
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const result = await getConfig();
  const settings: { imagesetPath: string, maxSaveRecentViewed: number, maxSaveRecentUploaded: number } = { imagesetPath: '', maxSaveRecentViewed: 0, maxSaveRecentUploaded: 0 };


  if (result.success) {
    settings.imagesetPath = result.data.imagesetPath;
    settings.maxSaveRecentViewed = result.data.maxSaveRecentViewed;
    settings.maxSaveRecentUploaded = result.data.maxSaveRecentUploaded;
  }

  return { props: settings };
}

export default Settings;
