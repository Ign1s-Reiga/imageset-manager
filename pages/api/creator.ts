import NextCors from 'nextjs-cors';
import { MongoDB } from 'lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { judgeCreatorQueryParams } from 'lib/utils';
import { z } from 'zod';

const CreatorPostReqSchema = z.string();

/*
 * このAPIは、クエリパラメータによって返すデータを変える。
 * クエリパラメータが "?type=author" の場合、登録された作者のデータを返す。
 * クエリパラメータが "?type=circle" の場合、登録されたサークルのデータを返す。
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const mongoDB = new MongoDB();
  await NextCors(req, res, {
    methods: ['GET', 'POST'],
    origin: '*',
    optionsSuccessStatus: 200
  });

  const { method, query: { type } } = req;

  const result = judgeCreatorQueryParams(type);
  // アーリーリターン的なの。typeが条件に当てはまらなかったら40X系のステータスコードを返す。
  if (result.statusCode !== 200) { // エラーの条件は lib/utils.ts の judgeCreatorQueryParams を参照
    res.status(result.statusCode).json({ err: result.err });
    return;
  }

  if (method === 'GET') {
    await mongoDB.connect().then(async () => {
      if (result.type === 'author') // クエリパラメータが "?type=author" の場合
        await mongoDB.authors.find().toArray().then((authors) => res.status(200).json(authors));
      else if (result.type === 'circle') // クエリパラメータが "?type=circle" の場合
        await mongoDB.circles.find().toArray().then((circles) => res.status(200).json(circles));
    }).then(async () => await mongoDB.close());
  } else if (method === 'POST') {
    const parsedBody = CreatorPostReqSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ err: 'Bad request (bad body format)' });
      return;
    }
    const name = parsedBody.data;
    await mongoDB.connect().then(async () => {
      if (result.type === 'author') { // クエリパラメータが "?type=author" の場合
        await mongoDB.authors.insertOne({ name: name }).then((result) => res.status(200).json(result));
      } else if (result.type === 'circle') { // クエリパラメータが "?type=circle" の場合
        await mongoDB.circles.insertOne({ name: name }).then((result) => res.status(200).json(result));
      }
    }).then(async () => await mongoDB.close());
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({ err: `${ method } is NOT Allowed.` });
  }
};
export default handler;
