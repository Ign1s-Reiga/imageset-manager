import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { IAuthor, ICircle, IRecent, MongoDB } from 'lib/mongodb';
import { ObjectId, WithId } from 'mongodb';
import { z } from 'zod';

export type IRplRecent = {
  _id: ObjectId;
  time: number;
  imageset: {
    id: ObjectId;
    name: string;
    author: WithId<IAuthor>[]
    circle: WithId<ICircle> | undefined
    type: 'Doujinshi' | 'CGImageSet' | 'Manga' | 'GameCG';
  };
}
const RecentPostReqSchema = z.object({
  id: z.string(),
  name: z.string(),
  author: z.array(z.object({ id: z.string(), name: z.string() })),
  circle: z.object({ id: z.string(), name: z.string() }).optional(),
  type: z.union([z.literal('Doujinshi'), z.literal('CGImageSet'), z.literal('Manga'), z.literal('GameCG')])
});

// TODO: RecentEditedの実装
/**
 * GET: 最近の閲覧/投稿/編集 履歴を取得。リスト長はism.config.jsonの maxSave系で指定されたものに依存する。
 * POST: 閲覧/投稿/編集 履歴を追加。
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const mongoDB = new MongoDB();
  await NextCors(req, res, {
    methods: ['GET', 'POST'],
    origin: '*',
    optionsSuccessStatus: 200
  });

  // query param: type = rv(recent viewed), ru(recent uploaded), re(recent edited)
  const { method, query: { type }, body } = req; // type: ru(recent uploaded), rv(recent viewed)
  if (typeof type !== 'string' || (type !== 'rv' && type !== 'ru')) {
    res.status(400).json({ err: 'Bad request (bad query param)' });
    return;
  }

  if (method === 'GET') {
    await mongoDB.connect()
      .then(async () => {
        const recentList = type === 'rv' ?
          await mongoDB.recentViewed.find().toArray() :
          await mongoDB.recentUploaded.find().toArray();
        const rplRecentList = recentList.map(({ _id, time, imageset }) => {
          const replaced: IRplRecent = {
            _id: _id,
            time: time,
            imageset: {
              id: imageset.id,
              name: imageset.name,
              author: imageset.author.map(({ _id, name }) => { return { _id: _id, name: name }; }),
              circle: imageset.circle !== undefined ? { _id: imageset.circle._id, name: imageset.circle.name } : undefined,
              type: imageset.type
            }
          };
          return replaced;
        });
        res.status(200).json(rplRecentList.reverse());
      }).then(async () => await mongoDB.close())
      .catch((err) => res.status(500).json({ err: `Internal Server Error, ${err}` }));
  } else if (method === 'POST') {
    await mongoDB.connect()
      .then(async () => {
        const result = RecentPostReqSchema.safeParse(body);
        if (!result.success) {
          res.status(400).json({ err: 'Bad request (bad body format)' });
          return;
        }
        const replaced: IRecent = {
          time: Date.now(),
          imageset: {
            id: new ObjectId(result.data.id),
            name: result.data.name,
            author: result.data.author.map(({ id, name }) => {
              return { _id: new ObjectId(id), name: name };
            }),
            circle: result.data.circle !== undefined ? { _id: new ObjectId(result.data.circle.id), name: result.data.circle.name } : undefined,
            type: result.data.type
          }
        };
        if (type === 'rv')
          await mongoDB.recentViewed.find().toArray()
            .then(async (v) => {
              if (v.length === 10) { // TODO: 一番古い履歴を消すのがうまく動いていない(直近二番目の履歴が消されたりする)
                let oldestTime: number = 0;
                for (let i of v)
                  if (oldestTime === 0 || oldestTime < i.time)
                    oldestTime = i.time;
                await mongoDB.recentViewed.findOneAndDelete({ time: oldestTime });
              }
            }).then(async () => await mongoDB.recentViewed.insertOne(replaced));
        else
          await mongoDB.recentUploaded.find().toArray()
            .then(async (v) => {
              if (v.length === 10) { // TODO: 一番古い履歴を消すのがうまく動いていない(直近二番目の履歴が消されたりする)
                let oldestTime: number = 0;
                for (let i of v)
                  if (oldestTime === 0 || oldestTime < i.time)
                    oldestTime = i.time;
                await mongoDB.recentUploaded.findOneAndDelete({ time: oldestTime });
              }
            }).then(async () => await mongoDB.recentUploaded.insertOne(replaced));
        await mongoDB.close().then(() => res.status(200).json({ result: 'success' }));
      }).then(async () => await mongoDB.close())
      .catch((err) => res.status(500).json({ err: `Internal Server Error, ${err}` }));
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({ err: `${ method } is NOT Allowed.` });
  }
};
export default handler;
