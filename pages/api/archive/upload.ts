import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import formidable from 'formidable';
import { getConfig, Logger } from 'lib/utils';
import fs from 'node:fs/promises';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { Data, test } from 'node-7z';
import sevenBin from '7zip-bin';

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    methods: ['POST'],
    origin: '*',
    optionsSuccessStatus: 200
  });
  const logger = new Logger();

  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ err: `${method} is NOT allowed.` });
    return;
  }

  const config = await getConfig();
  if (!config.success) {
    res.status(500).json({ err: 'Internal Server Error' });
    await logger.warn('An error occurred while parsing config file.');
    return;
  }

  await fs.stat(path.join(config.data.imagesetPath, 'temp')).catch(async (err) => {
    if (err.code === 'ENOENT')
      await fs.mkdir(path.join(config.data.imagesetPath, 'temp'));
  });
  await fs.readdir(path.join(config.data.imagesetPath, 'temp')).then(async (files) => {
    if (files.length !== 0)
      await fs.rm(path.join(config.data.imagesetPath, 'temp', files[0]), { force: true });
  });

  const form = new formidable.IncomingForm();
  form.onPart = (part) => {
    if (part.originalFilename === '' || !part.mimetype)
      form._handlePart(part);
    else if (part.originalFilename) {
      const filePath = path.join(config.data.imagesetPath, part.originalFilename);
      const stream = createWriteStream(filePath);
      part.pipe(stream);

      part.on('end', async () => {
        stream.close();
        await logger.info(`Upload Imageset: ${part.originalFilename}`);
        test(filePath, { $bin: sevenBin.path7za }).on('end', () => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.status(201).json({ result: 'success', fileName: part.originalFilename });
        }).on('error', () => {
          res.status(500).json({ err: 'Internal Server Error' });
        });
      });
    }
  };
  form.on('error', async () => {
    await logger.warn('An error occurred while uploading a file to the server.').then(() => {
      res.status(500).json({ err: 'Internal Server Error' });
    });
    return;
  }).parse(req);
};
export default handler;
