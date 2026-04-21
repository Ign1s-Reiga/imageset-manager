import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoDB } from 'lib/mongodb';
import { ObjectId } from 'mongodb';

const QuerySchema = z.union([z.literal('archive'), z.literal('author'), z.literal('circle')]);
const ImageSetDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  releaseDate: z.string(),
  author: z.array(z.object({ name: z.string(), id: z.string() })),
  circle: z.object({ name: z.string(), id: z.string() }).optional(),
  type: z.union([z.literal('Doujinshi'), z.literal('CGImageSet'), z.literal('Manga'), z.literal('GameCG')]),
});
type ImageSetDataType = z.infer<typeof ImageSetDataSchema>;

const convertToUpdateSet = (imagesetData: ImageSetDataType) => {
  type ImageSetUpdateSet = {
    name: string,
    releaseDate: Date,
    author: ObjectId[],
    circle: ObjectId | undefined,
    type: 'Doujinshi' | 'CGImageSet' | 'Manga' | 'GameCG'
  };
  const updateSet: ImageSetUpdateSet = {
    name: imagesetData.name,
    releaseDate: new Date(imagesetData.releaseDate),
    author: imagesetData.author.map((v) => new ObjectId(v.id)),
    circle: imagesetData.circle !== undefined ? new ObjectId(imagesetData.circle.id) : undefined,
    type: imagesetData.type
  };
  return updateSet;
};

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const mongoDB = new MongoDB();
  const { method, body, query: { type } } = req;
  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ err: `${ method } is NOT Allowed.` });
    return;
  }
  const typeParsed = QuerySchema.safeParse(type);
  if (!typeParsed.success) {
    res.status(400).json({ err: 'Bad request (bad query format)' });
    return;
  }
  if (typeParsed.data === 'archive') {
    const result = ImageSetDataSchema.safeParse(body);
    if (!result.success) {
      res.status(400).json({ err: 'Bad request (bad body format)' });
      return;
    }
    // TODO: tags, releaseDateの仕様が策定された際に、この実装を改善させる。
    await mongoDB.connect().then(async () => {
      const updateSet = convertToUpdateSet(result.data);
      await mongoDB.imagesets.updateOne({ id: result.data.id }, {
        $set: {
          name: updateSet.name,
          releaseDate: updateSet.releaseDate,
          author: updateSet.author,
          circle: updateSet.circle,
          type: updateSet.type
        }
      }, { upsert: false }).then((result) => res.status(200).json(result));
    }).then(async () => await mongoDB.close());
  } else if (typeParsed.data === 'author') {

  } else if (typeParsed.data === 'circle') {

  }
};
export default handle;

