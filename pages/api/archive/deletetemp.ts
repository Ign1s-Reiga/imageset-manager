import { NextApiRequest, NextApiResponse } from 'next';
import * as path from 'path';
import fs from 'node:fs/promises';
import { Logger } from 'lib/utils';
import NextCors from 'nextjs-cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    methods: ['GET'],
    origin: '*',
    optionsSuccessStatus: 200
  });
  const logger = new Logger();

  const dirPath = path.join(process.cwd(), 'public/temp');
  const dirList = await fs.readdir(path.join(process.cwd(), 'public/temp'));
  if (dirList.length === 0) {
    res.status(200).json({ result: 'empty' });
    return;
  }

  let isFailed = false;
  let errMsg: any = undefined;
  for (const filePath of dirList)
    await fs.rm(path.join(dirPath, filePath), { force: true })
      .catch((err) => { isFailed = true; errMsg = err; });
  res.status(isFailed ? 500 : 200).json(isFailed ? { result: errMsg } : { result: 'success' });
  if (isFailed)
    await logger.warn('Failed to remove some tmp-image files. Please remove manually or restart server.');
};
export default handler;
