import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Search, SearchIconWrapper, StyledInputBase } from 'components/SearchBoxComponents';
import SearchIcon from '@mui/icons-material/SearchRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import { theme } from 'lib/theme';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { css } from '@emotion/react';
import axios from 'axios';

const styles = {
  container: css`
    background-color: ${theme.surface.container.low};
  `,
  rightBox: css`
    border-radius: 4px;
    background-color: ${theme.surface.container.high};
    display: flex;
    flex-wrap: nowrap;
    padding: 8px 0;
  `
};

const Header = () => {
  const router = useRouter();
  const [searchWord, setSearchWord] = useState('');

  const handlerPushSideButtons = (dest: string) => {
    router.push(dest).then(() => {
      if (router.pathname.includes('[id]'))
        axios.get('/api/archive/deletetemp', { baseURL: 'http://127.0.0.1:3000' });
    });
  };

  const handlerSearch = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      console.log(searchWord);
    }
  };

  const handlerSearchWord = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchWord(e.target.value);
  };

  return (
    <AppBar elevation={0} position='static' css={ styles.container }>
      <Toolbar css={ css`padding: 6px 0;` }>
        <Typography variant='h5' sx={{ flexGrow: 1, color: '#11140e' }}>ImageSet Manager</Typography>
        <div css={ styles.rightBox }>
          <Search>
            <SearchIconWrapper>
              <SearchIcon/>
            </SearchIconWrapper>
            <StyledInputBase
              placeholder='Search...'
              inputProps={{ 'aria-label': 'ImageSetを検索する' }}
              value={ searchWord }
              onChange={ e => handlerSearchWord(e) }
              onKeyDown={ e => handlerSearch(e)}
            />
          </Search>
          <IconButton sx={{ mr: 2, ml: 2 }} onClick={ () => handlerPushSideButtons('/') }>
            <HomeIcon/>
          </IconButton>
          <IconButton sx={{ mr: 2 }} onClick={ () => handlerPushSideButtons('/upload') }>
            <UploadIcon/>
          </IconButton>
          <IconButton sx={{ mr: 2 }} onClick={ () => handlerPushSideButtons('/register') }>
            <AddIcon/>
          </IconButton>
          <IconButton sx={{ mr: 2 }} onClick={ () => handlerPushSideButtons('/settings') }>
            <SettingsIcon/>
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
