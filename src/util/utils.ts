import { ObjectId } from 'mongodb';
import * as path from 'path';
import fs from 'node:fs/promises';
import { z } from 'zod';
import { extract } from 'node-7z';
import sevenBin from '7zip-bin';
import * as process from 'process';

type QueryType = string | string[] | undefined;

// TODO: もっと条件式単純化できねえかなという気持ち。このif文の連ね方キモすぎて嫌い。
export function judgeImagesetQueryParams(id: QueryType, num: QueryType, startIndex: QueryType): { statusCode: number, type: 'all' | 'id' | 'range' | undefined, err: string } {
  /*
   * 以下の条件を満たした場合400で蹴る
   *
   * 1. idがundefinedかつ、num, startIndexの片方がundefinedの時 -> bad query params 400
   * 2. id, num, startIndexすべてがundefinedではない時 -> too many query params 400
   * 3. idがundefinedではなく、そしてnum, startIndexの片方がundefinedではない時 -> too many query params 400
   * 4. idのみ指定したが、idがObjectIdではない時 -> bad query params 400
   * 5. numとstartIndexを指定したが、どちらもNumberではない、または負の値ではない時 -> bad query params 400
   * (1 ~ 3は二段目の条件式(クエリのフォーマットが正しいか否かを判定、正しければ200を返す)のelseでまとめて処理)
   */
  if (id !== undefined && !ObjectId.isValid(id as string))
    return { statusCode: 400, type: undefined, err: 'Bad Request (bad query param)' };
  if (startIndex !== undefined && (!Number.isInteger(Number(startIndex as string)) || Number(startIndex as string) < 0))
    return { statusCode: 400, type: undefined, err: 'Bad Request (bad query param)' };
  if (num !== undefined && (!Number.isInteger(Number(num as string)) || Number(num as string) < 0))
    return { statusCode: 400, type: undefined, err: 'Bad Request (bad query param)' };

  if (id === undefined && num === undefined && startIndex === undefined)
    return { statusCode: 200, type: 'all', err: '' };
  else if (id !== undefined && num === undefined && startIndex === undefined)
    return { statusCode: 200, type: 'id', err: '' };
  else if (id === undefined && num !== undefined && startIndex !== undefined)
    return { statusCode: 200, type: 'range', err: '' };
  else
    return { statusCode: 400, type: undefined, err: 'Bad Request (bad query param)' };
}

export function judgeCreatorQueryParams(type: QueryType): { statusCode: number, type: 'circle' | 'author' | undefined, err: string } {
  if (type !== 'author' && type !== 'circle')
    return { statusCode: 400, type: undefined, err: 'Bad Request (bad query param)' };

  if (type === 'author')
    return { statusCode: 200, type: 'author', err: '' };
  else if (type === 'circle')
    return { statusCode: 200, type: 'circle', err: '' };
  else
    return { statusCode: 400, type: undefined, err: 'Bad Request (bad query param)' };
}

export const Config = z.object({
  imagesetPath: z.string(),
  maxSaveRecentViewed: z.number(),
  maxSaveRecentUploaded: z.number(),
}).passthrough();

export const getConfig = async () => {
  const parsedString = await fs.readFile(path.join(process.cwd(), 'ism.config.json'), 'utf8');
  return Config.safeParse(JSON.parse(parsedString));
};

/**
 * サムネイル(一枚目の画像ファイル)をpublic/thumbnailにコピーする
 *
 * @param id- ImagesetのObjectIdをtoString()したもの
 * @param imagesetPath - Imagesetの保存場所のパス
 */
export const createThumbnail = (id: string, imagesetPath: string) => {
  const imagesetTempPath = path.join(imagesetPath, 'temp');
  extract(path.join(imagesetPath, `${id}.7z`), imagesetTempPath, {
    $bin: sevenBin.path7za,
  }).once('end', async () => {
    await fs.readdir(imagesetTempPath).then(async (files) => {
      const fileName = files[0].split('.');
      await fs.rename(path.join(imagesetTempPath, files[0]), path.join(process.cwd(), `public/thumbnail/${id}.${fileName[fileName.length - 1]}`));
      for (const file of files)
        await fs.rm(path.join(imagesetTempPath, file), { force: true });
    });
  });
};

export class Logger {
  logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
  }

  async log(level: 'info' | 'warn', log: string) {
    await this.checkLogExists().then(async () => {
      await this.isOld(path.join(this.logDir, 'latest.log')).then(async (v) => {
        if (v.isOld)
          await this.renameOldLogFile(v.lmyear, v.lmmonth, v.lmdate);
      }).then(async () => {
        await fs.writeFile(path.join(this.logDir, 'latest.log'), `[${new Date().toLocaleTimeString()}] [${level.toUpperCase()}]: ${log}\n`, 'utf8');
      });
    });
  }

  async info(log: string) {
    await this.log('info', log);
  }

  async warn(log: string) {
    await this.log('warn', log);
  }

  private async isOld(path: string) {
    return await fs.stat(path).then((stats) => {
      const [lastModifiedYear, lastModifiedMonth, lastModifiedDate] =
        [new Date(stats.mtime).getFullYear(), new Date(stats.mtime).getMonth(), new Date(stats.mtime).getDate()];
      const now = new Date();
      const isOld = now.getFullYear() > lastModifiedYear ? true :
        now.getMonth() > lastModifiedMonth ? true : now.getDate() > lastModifiedDate;
      return { isOld: isOld, lmyear: lastModifiedYear, lmmonth: lastModifiedMonth, lmdate: lastModifiedDate };
    });
  }

  private async renameOldLogFile(lmyear: number, lmmonth: number, lmdate: number) {
    await fs.rename(path.join(this.logDir, 'latest.log'), path.join(this.logDir, `${lmyear}-${lmmonth}-${lmdate}.log`));
  }

  private async checkLogExists() {
    await fs.stat(this.logDir).catch(async (err) => {
      if (err.code === 'ENOENT')
        await fs.mkdir(path.join(this.logDir));
    }).then(async () => {
      await fs.stat(path.join(this.logDir, 'latest.log')).catch(async (err) => {
        if (err.code === 'ENOENT')
          await fs.writeFile(path.join(this.logDir, 'latest.log'), '', 'utf8');
      });
    });
  }
}
