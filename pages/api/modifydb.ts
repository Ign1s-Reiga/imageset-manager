// DBのスキームをいじる用、用がなくなったら消すこと

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoDB } from 'lib/mongodb';
import NextCors from 'nextjs-cors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const mongoDB = new MongoDB();

  const { method } = req;
  let success = false;

  if (method === 'GET') {
    await mongoDB.connect();
    await mongoDB.imagesets.updateMany({}, { $set: { isFavorited: false } });
    success = true;
  }
  res.status(200).json({ result: success });
};
