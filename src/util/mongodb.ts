'use server'

import { Collection, Db, MongoClient, ObjectId, WithId } from 'mongodb';

export class MongoDB {
  #client: MongoClient;
  #database = 'imageset-manager';

  constructor() {
    const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/?authSource=kwi-resource-viewer`;

    this.#client = new MongoClient(uri);
  }

  async connect(): Promise<Db | null> {
    return await this.#client.connect()
      .then(() => {
        console.log('[MongoDB] Successfully connected to MongoDB');
        return this.#client.db(this.#database);
      })
      .catch((err) => {
        console.error(`[MongoDB] Failed to connect to MongoDB: ${err}`);
        return null;
      });
  }

  async close() {
    await this.#client.close()
      .then(() => console.log('[MongoDB] Closed MongoDB connection'));
  }
}

export interface IImageSet {
  _id: ObjectId;
  name: string;
  releaseDate: Date;
  author: {
    id: string;
    name: string;
  }[];
  circle: {
    id: string;
    name: string;
  } | undefined;
  tags: string[];
  type: 'Doujinshi' | 'CGImageSet' | 'Manga' | 'GameCG';
}

export interface IAuthor {
  _id: ObjectId;
  name: string;
  imagesets: ObjectId[];
}

export interface ICircle {
  _id: ObjectId;
  name: string;
}

export interface IRecent {
  time: Date; // ミリ秒、IRplRecentでDate型に変換する。
  imageset: {
    id: ObjectId;
    name: string;
    author: WithId<IAuthor>[];
    circle: WithId<ICircle> | undefined;
    type: 'Doujinshi' | 'CGImageSet' | 'Manga' | 'GameCG';
  };
}
