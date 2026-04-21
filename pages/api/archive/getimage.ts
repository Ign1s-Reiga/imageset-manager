import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs/promises';
import * as path from 'path';
import NextCors from 'nextjs-cors';

// サーバーサイドにある画像をapiを使って取得する、パスとファイルリスト長を返すだけ
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ err: `${ req.method } is NOT Allowed.` });
    return;
  }

  const files = await fs.readdir(path.join(process.cwd(), 'public/temp'));
  res.status(200).json({ size: files.length, fileList: files });
};
export default handler;
