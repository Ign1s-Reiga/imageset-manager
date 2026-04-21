import { NextApiRequest, NextApiResponse } from 'next';
import { IAuthor, ICircle, IImageSet, MongoDB } from 'lib/mongodb';
import NextCors from 'nextjs-cors';
import { createThumbnail, getConfig, judgeImagesetQueryParams } from 'lib/utils';
import { ObjectId, WithId } from 'mongodb';
import { IRplImageSet, postHeader } from 'pages/index';
import axios from 'axios';
import { z } from 'zod';
import fs from 'node:fs/promises';
import * as path from 'path';

const ImageSetsPostReq = z.object({
  title: z.string(),
  releaseDate: z.string(),
  author: z.array(z.object({ name: z.string(), id: z.string() })),
  circle: z.object({ name: z.string(), id: z.string() }).optional(),
  type: z.union([z.literal('Doujinshi'), z.literal('CGImageSet'), z.literal('Manga'), z.literal('GameCG')]),
  fileName: z.string()
});

const transformToIRplImageSet =
  (original: WithId<IImageSet> | WithId<IImageSet>[] | null, authorList: WithId<IAuthor>[], circleList: WithId<ICircle>[]): IRplImageSet | IRplImageSet[] | null => {
    if (original === null)
      return null;
    if (Array.isArray(original)) { // Arrayの場合
      return original.map((imageset) => {
        const replaced: IRplImageSet = {
          _id: imageset._id,
          name: imageset.name,
          releaseDate: imageset.releaseDate,
          author: imageset.author.map((v) => {
            const author: WithId<IAuthor> = {
              _id: v,
              name: authorList.find((e) => v.equals(e._id))?.name ?? ''
            };
            return author;
          }),
          circle: imageset.circle !== undefined ? circleList.find(e => imageset.circle?.equals(e._id)) : undefined,
          tags: imageset.tags,
          type: imageset.type,
          isFavorited: imageset.isFavorited
        };
        return replaced;
      });
    } else {
      return {
        _id: original._id,
        name: original.name,
        releaseDate: new Date(original.releaseDate),
        author: original.author.map((v) => {
          const author: WithId<IAuthor> = {
            _id: v,
            name: authorList.find((e) => v.equals(e._id))?.name ?? ''
          };
          return author;
        }),
        circle: original.circle !== undefined ? circleList.find(e => original.circle?.equals(e._id)) : undefined,
        tags: original.tags,
        type: original.type,
        isFavorited: original.isFavorited
      };
    }
  };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const mongoDB = new MongoDB();
  await NextCors(req, res, {
    methods: ['GET', 'POST'],
    origin: '*',
    optionsSuccessStatus: 200
  });

  /*
  * id: ObjectId -> ImageSetのID、単体で取得する際に使う(例, Archiveページから /api/imagesets?id=xxxxxx)
  * num: Number -> 取得するImageSetの数、未指定の場合は50か75件ずつ取得する。
  * startIndex: Number -> 取得するImageSetの開始位置、未指定の場合は0から。
   */
  const { method, query: { id, num, startIndex } } = req;
  const result = judgeImagesetQueryParams(id, num, startIndex);
  if (result.statusCode !== 200) {
    res.status(result.statusCode).json({ err: result.err });
    return;
  }

  if (method === 'GET') {
    await mongoDB.connect()
      .then(async () => {
        const authorList = await axios.get<WithId<IAuthor>[]>('/api/creator', { baseURL: 'http://127.0.0.1:3000', params: { type: 'author' }, headers: { 'Accept-Encoding': 'application/json' }})
          .then(({ data }) => { return data; });
        const circleList = await axios.get<WithId<ICircle>[]>('/api/creator', { baseURL: 'http://127.0.0.1:3000', params: { type: 'circle' }, headers: { 'Accept-Encoding': 'application/json' }})
          .then(({ data }) => { return data; });

        if (result.type === 'id') {
          const imageset = await mongoDB.imagesets.findOne({ _id: new ObjectId(id as string) });
          res.status(200).json(transformToIRplImageSet(imageset, authorList, circleList));
        } else if (result.type === 'range') {
          const imagesets = await mongoDB.imagesets.find().toArray();
          const list: WithId<IImageSet>[] = [];
          if (Number(startIndex) > imagesets.length - 1)
            res.status(400).json({ err: 'startIndex is out of range.' });
          else {
            const count = Number(num) > (imagesets.length - 1) - Number(startIndex) ? (imagesets.length - 1) - Number(startIndex) : Number(num);
            for (let i = Number(startIndex); i < Number(startIndex) + count; i++)
              list.push(imagesets[i]);
            res.status(200).json(transformToIRplImageSet(list, authorList, circleList));
          }
        } else if (result.type === 'all') {
          const imagesets = await mongoDB.imagesets.find().toArray();
          res.status(200).json(transformToIRplImageSet(imagesets, authorList, circleList));
        }
      }).then(async () => await mongoDB.close());
  } else if (method === 'POST') {
    const result = ImageSetsPostReq.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ err: 'Bad request (bad body format)' });
      return;
    }
    const config = await getConfig();
    if (!config.success) {
      res.status(500).json({ err: 'Internal Server Error' });
      return;
    }
    const { title, releaseDate, author, circle, type, fileName } = result.data;
    await mongoDB.connect()
      .then(async () => {
        const imageset: IImageSet = {
          name: title,
          releaseDate: new Date(releaseDate),
          author: author.map(({ id }) => new ObjectId(id)),
          circle: circle !== undefined ? new ObjectId(circle.id) : undefined,
          tags: [],
          type: type,
          isFavorited: false
        };
        await mongoDB.imagesets.insertOne(imageset)
          .then(async (result) => {
            const id = result.insertedId;
            return await fs.rename(path.join(config.data.imagesetPath, fileName), path.join(config.data.imagesetPath, `${id.toString()}.7z`)).then(() => id);
          }).then(async (id) => {
            await axios.post('/api/recent', {
              id: id.toString(),
              name: title,
              author: author,
              circle: circle,
              type: type
            }, { baseURL: 'http://localhost:3000', params: { type: 'ru' }, headers: { 'Content-Type': 'application/json', ...postHeader } });
            return id;
          }).then(async (id) => {
            createThumbnail(id.toString(), config.data.imagesetPath);
          }).catch((err) => {
            console.log(err);
            res.status(500).json({ err: 'Internal Server Error' });
          });
        res.status(200).json({ result: 'success' });
      }).then(async () => await mongoDB.close());
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({ err: `${ method } is NOT Allowed.` });
  }
};

export default handler;
