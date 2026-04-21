import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import sevenBin from '7zip-bin';
import { ObjectId } from 'mongodb';
import fs from 'node:fs/promises';
import * as path from 'path';
import { extract } from 'node-7z';
import { getConfig, Logger } from 'lib/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200
  });
  const logger = new Logger();

  const { id } = req.query;

  if (typeof id !== 'string') {
    res.status(400).json({ err: 'Bad request' });
    return;
  }

  const config = await getConfig();
  if (!config.success) {
    res.status(500).json({ err: 'Internal Server Error' });
    await logger.warn('An error occurred while parsing config file.');
    return;
  }

  if (ObjectId.isValid(id)) {
    const filePath = path.join(config.data.imagesetPath, `${id}.7z`);
    const exists = await fs.stat(filePath) // 適当存在チェッカー エラーが起きた時点で存在しないものとしてる。
      .then(() => { return true; })
      .catch(() => { return false; });
    if (exists) {
      extract(filePath, path.join(process.cwd(), 'public/temp'), {
        $bin: sevenBin.path7za,
        recursive: true,
      }).once('end', async () => {
        const files = await fs.readdir(path.join(process.cwd(), 'public/temp'));
        // TODO: この機能を POST imagesetsに移植する。
        await fs.copyFile(path.join(process.cwd(), 'public/temp', files[0]), path.join(process.cwd(), 'public/thumbnail', `${id}.webp`))
          .then(() => {
            res.status(200).json({ exists: exists, result: true });
          }).catch(() => res.status(500).json({ err: 'Internal Server Error' }));
      });
    } else
      res.status(400).json({ exists: exists, result: false });
  } else
    res.status(400).json({ err: 'Bad request' });
};
export default handler;
