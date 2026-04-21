import { IRplRecent } from 'pages/api/recent';
import { Typography } from '@mui/material';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { theme } from 'lib/theme';
import { IBM_PLEX_SANS_JP } from 'pages/_app';
import { WithId } from 'mongodb';
import { IAuthor } from 'lib/mongodb';
import { replaceTypeString } from 'components/ArchiveDescBox';

const styles = {
  box: css`
    display: flex;
    flex-direction: column;
    padding: 0 0.5rem;
    background-color: ${theme.surface.container.low};
    border-radius: 5px;
    transition: background-color 180ms ease-in;
    cursor: pointer;
    p {
      font-family: ${IBM_PLEX_SANS_JP.style.fontFamily};
    }
    :hover {
      background-color: ${theme.surface.container.high};
    }
  `,
  name: css`
    font-size: 0.9rem;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  `,
  desc: css`
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
    overflow-x: hidden;
    white-space: nowrap;
    p {
      font-size: 0.68rem;
    }
  `,
  time: css`
    font-size: 0.6rem;
    color: #4f5256;
  `
};

const SidebarRecentBox = ({ recent }: { recent: IRplRecent }) => {
  const router = useRouter();

  const handleClickRecentBox = () => {
    router.push(recent.imageset.id.toString());
  };

  const getAuthorList = (authorList: WithId<IAuthor>[]): string => {
    let authorStr = '';
    authorList.forEach((v, i) => {
      if (i > 2) {
        authorStr += `他 ${ authorList.length - 2 }人`;
        return;
      } else
        authorStr += v.name;
    });
    return authorStr;
  };

  return (
    <div css={ styles.box } onClick={handleClickRecentBox}>
      <Typography css={ styles.name }>{ recent.imageset.name }</Typography>
      <div css={ styles.desc }>
        <Typography>{ `作:${getAuthorList(recent.imageset.author)}` }</Typography>
        {
          recent.imageset.circle !== undefined ?
            <Typography>{ `所属:${recent.imageset.circle.name}` }</Typography> : ''
        }
        <Typography>{ `${replaceTypeString(recent.imageset.type)}` }</Typography>
      </div>
      <Typography css={ styles.time }>{ new Date(recent.time).toLocaleString() }</Typography>
    </div>
  );
};
export default SidebarRecentBox;
