import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import fs from 'node:fs/promises';
import { getConfig } from 'lib/utils';
import path from 'path';
import { ObjectId } from 'mongodb';

const DeleteReqSchema = z.string();

/**
 * Imagesetを削除するAPI, DELETEメソッドのみ許可, bodyにImagesetのObjectId(String)を指定する.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    methods: ['DELETE'],
    origin: '*',
    optionsSuccessStatus: 200
  });

  const { method, body } = req;
  if (method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ err: `${ method } is NOT Allowed.` });
    return;
  }
  const config = await getConfig();
  const result = DeleteReqSchema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ err: 'Bad request' });
    return;
  } else if (!config.success) {
    res.status(500).json({ err: 'Internal server error' });
    return;
  } else if (!ObjectId.isValid(result.data)) {
    res.status(400).json({ err: 'Bad request' });
    return;
  }
  const id = result.data;
  const fileName = await fs.readdir(config.data.imagesetPath).then(async (files) => {
    return files.find((file) => file.includes(id));
  });
  if (fileName === undefined)
    res.status(204).json({ result: 'notfound' });
  else {
    fs.rm(path.join(config.data.imagesetPath, fileName), { force: true }).then(() => res.status(200).json({ result: 'success' }));
  }
};
