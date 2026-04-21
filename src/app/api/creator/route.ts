import { IAuthor, ICircle, MongoDB } from "@/util/mongodb"
import { WithId } from "mongodb"

export type GetCreatorRsp = {
  type: "author";
  payload: WithId<IAuthor> | null;
} | {
  type: "circle";
  payload: WithId<ICircle> | null;
};

export async function GET(req: Request) {
  const mongoDB = new MongoDB();

  const type = new URL(req.url).searchParams.get("type");
  if (!type || (type !== "author" && type !== "circle")) {
    return new Response(JSON.stringify({ err: "Invalid type parameter" }), { status: 400 });
  }

  const rsp: GetCreatorRsp = await mongoDB.connect().then(async (db) => {
    if (!db) {
      return { type: type, payload: null };
    }

    switch (type) {
      case "author":
        return db.collection<IAuthor>(type).findOne({ _id: new ObjectId(url.searchParams.get("id") || "") });
      case "circle":
        return db.collection<ICircle>(type).findOne({ _id: new ObjectId(url.searchParams.get("id") || "") });
    }

    if (type === "author") {
      const author = await mongoDB.authors.findOne({ _id: new ObjectId(url.searchParams.get("id") || "") });
      return { type: "Author", payload: author };
    } else if (type === "circle") {
      const circle = await mongoDB.circles.findOne({ _id: new ObjectId(url.searchParams.get("id") || "") });
      return { type: "Circle", payload: circle };
    } else {
      return { type: "Author", payload: null }; // Default case
    }
  });
}

export async function POST(req: Request) {

}
