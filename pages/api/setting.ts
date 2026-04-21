import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { Config } from 'lib/utils';
import fs from 'node:fs/promises';
import path from 'path';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200
  });

  const { method, body } = req;
  if (method !== 'POST' && method !== 'OPTIONS') {
    res.status(405).json({ err: `${ method } is NOT Allowed.` });
    return;
  }

  const config = Config.safeParse(body);
  if (!config.success) {
    res.status(400).json({ err: config.error });
    return;
  }
  await fs.writeFile(path.join(process.cwd(), 'ism.config.json'), JSON.stringify(config.data), 'utf8');
  res.status(200).json({ result: 'success' });
};
export default handle;
