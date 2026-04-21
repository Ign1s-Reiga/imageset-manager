import { IRplImageSet, postHeader } from 'pages';
import React, { useState } from 'react';
import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, FormControl, InputLabel, MenuItem, Select, Snackbar, TextField, Typography } from '@mui/material';
import { css } from '@emotion/react';
import { IBM_PLEX_SANS_JP } from 'pages/_app';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import { theme } from 'lib/theme';
import axios from 'axios';

type ImageSetData = {
  id: string,
  name: string,
  author: { id: string, name: string }[],
  circle: { id: string, name: string } | string,
  type: string,
};

type Props = {
  imageset: IRplImageSet,
  authors: { id: string, name: string }[],
  circles: { id: string, name: string }[],
  open: boolean,
  openFn: React.Dispatch<React.SetStateAction<boolean>>,
}

const styles = {
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
};

const convertTypeString = (imageset: IRplImageSet) => {
  const imagesetData: ImageSetData = {
    id: imageset._id.toString(),
    name: imageset.name,
    author: imageset.author.map((v) => ({ id: v._id.toString(), name: v.name })),
    circle: imageset.circle !== undefined ? { id: imageset.circle._id.toString(), name: imageset.circle.name } : 'none',
    type: imageset.type,
  };
  return imagesetData;
};

const ArchiveEditDrawer = ({ imageset, authors, circles, open, openFn }: Props) => {
  const [imagesetData, setImagesetData] = useState(convertTypeString(imageset));
  const [buttonState, setButtonState] = useState({ delete: false, save: false });
  const [showSnackbar, setShowSnackbar] = useState({ deleteSuccess: false, deleteErr: false, saveSuccess: false, saveErr: false });
  const [openDialog, setOpenDialog] = useState(false);

  const handlePressDeleteButton =  () => {
    setButtonState(prevState => ({ ...prevState, delete: true }));
    axios.delete('/api/archive/delete', { baseURL: 'http://localhost:3000', headers: { 'Content-Type': 'text/plain', ...postHeader }, data: imagesetData.id })
      .then(() => {
        setButtonState(prevState => ({ ...prevState, delete: false }));
        setShowSnackbar(prevState => ({ ...prevState, deleteSuccess: true }));
      }).catch(() => {
        setButtonState(prevState => ({ ...prevState, delete: false }));
        setShowSnackbar(prevState => ({ ...prevState, deleteErr: true }));
      });
  };

  const handlePressSaveButton = () => {
    if (imagesetData.name === '') return;
    setButtonState(prevState => ({ ...prevState, save: true }));
    axios.post('/api/edit', imagesetData, { baseURL: 'http://localhost:3000', params: { type: 'archive' }, headers: { 'Content-Type': 'text/plain', ...postHeader } })
      .then(() => {
        setButtonState(prevState => ({ ...prevState, save: false }));
        setShowSnackbar(prevState => ({ ...prevState, saveSuccess: true }));
      }).catch(() => {
        setButtonState(prevState => ({ ...prevState, save: false }));
        setShowSnackbar(prevState => ({ ...prevState, saveErr: true }));
      });
  };

  const getCircleMenuItems = () => {
    const menuItems = [<MenuItem key='none' value='none'>なし</MenuItem>];
    menuItems.push(...circles.map((circle) => <MenuItem key={ circle.id } value={ circle.id }>{ circle.name }</MenuItem>));
    return menuItems;
  };

  const handleCloseSnackbar = (e?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setShowSnackbar(prevState => ({ ...prevState, deleteSuccess: false, deleteErr: false, saveSuccess: false, saveErr: false }));
  };

  return (
    <Drawer
      open={ open }
      anchor='right'
      onClose={ () => openFn(false) }
      PaperProps={{ sx: { ...styles.paperProps } }}
    >
      <Typography css={ css`font-weight: 700; font-family: ${IBM_PLEX_SANS_JP.style.fontFamily}; font-size: 2rem; padding-left: 1.2rem;` }>編集</Typography>
      <div css={ styles.container }>
        <TextField
          css={ css`input { padding: 4px 5px 5px 5px; }` }
          label='タイトル'
          variant='standard'
          value={ imagesetData.name }
          onChange={ (e) =>
            setImagesetData(prevState => ({...prevState, name: e.target.value})) }
        />
        <Autocomplete
          options={ authors }
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, v) => option.id === v.id }
          value={ imagesetData.author }
          onChange={ (e, newValue) =>
            setImagesetData(prevState => ({...prevState, author: newValue})) }
          multiple
          ChipProps={{ size: 'small' }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant='standard'
              label='作者'
            />
          )}
        />
        <FormControl variant='standard'>
          <InputLabel id='drawer-select-circles-label'>サークル</InputLabel>
          <Select
            css={ css`div { padding-left: 5px; }` }
            labelId='drawer-select-circles-label'
            value={ typeof imagesetData.circle !== 'string' ? imagesetData.circle.id : imagesetData.circle }
            onChange={ (e) =>
              setImagesetData(prevState => ({...prevState, circle: circles.find((v) => v.id === e.target.value) ?? e.target.value })) }
          >
            { getCircleMenuItems() }
          </Select>
        </FormControl>
        <FormControl variant='standard'>
          <InputLabel id='drawer-select-type-label'>タイプ</InputLabel>
          <Select
            css={ css`div { padding-left: 5px; }` }
            labelId='drawer-select-type-label'
            value={ imagesetData.type }
            onChange={ (e) =>
              setImagesetData(prevState => ({...prevState, type: e.target.value })) }
            label='タイプ'
          >
            <MenuItem value='Doujinshi'>同人誌</MenuItem>
            <MenuItem value='CGImageSet'>CG・画像集</MenuItem>
            <MenuItem value='Manga'>マンガ</MenuItem>
            <MenuItem value='GameCG'>ゲームCG</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div css={ css`display: flex; flex-direction: row; justify-content: space-between; button { min-width: 45% }` }>
        <Button
          onClick={ () => setOpenDialog(true) }
          variant='contained'
          disableElevation
          color='error'
          startIcon={<DeleteIcon/>}
          disabled={ buttonState.delete }
        >
          削除
        </Button>
        <Button
          onClick={ handlePressSaveButton }
          variant='contained'
          disableElevation
          startIcon={<CheckIcon/>}
          disabled={ buttonState.save }
        >
          保存
        </Button>
      </div>
      <Dialog open={ openDialog } onClose={ () => setOpenDialog(false) }>
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          <DialogContentText>本当にこのImagesetを削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={ handlePressDeleteButton } color='error'>はい</Button>
          <Button onClick={ () => setOpenDialog(false) } color='primary'>いいえ</Button>
        </DialogActions>
      </Dialog>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.deleteSuccess } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
        <Alert severity='success' onClose={ handleCloseSnackbar } sx={{ width: '100%' }}>{ '削除しました' }</Alert>
      </Snackbar>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.deleteErr } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
        <Alert severity='success' onClose={ handleCloseSnackbar } sx={{ width: '100%' }}>{ '削除できませんでした' }</Alert>
      </Snackbar>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.saveSuccess } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
        <Alert severity='success' onClose={ handleCloseSnackbar } sx={{ width: '100%' }}>{ '保存しました' }</Alert>
      </Snackbar>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={ showSnackbar.saveErr } autoHideDuration={6000} onClose={ handleCloseSnackbar }>
        <Alert severity='success' onClose={ handleCloseSnackbar } sx={{ width: '100%' }}>{ '保存できませんでした' }</Alert>
      </Snackbar>
    </Drawer>
  );
};
export default ArchiveEditDrawer;
