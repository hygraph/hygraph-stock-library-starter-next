import Link from "next/link";
import Card from "@/components/Card";
import { GraphQLClient } from "graphql-request";

type Asset = {
  id: string;
  handle: string;
  fileName: string;
  grid: string;
  publishedAt: string;
  height: number;
  width: number;
  mimeType: string;
  size: string;
  alt: string;
  tags: string[];
  createdBy: {
    name: string;
    picture: string;
  };
};

type Assets = {
  assets: Asset[];
};

async function getAssets() {
  //@ts-ignore
  const client = new GraphQLClient(process.env.NEXT_HYGRAPH_ENDPOINT);

  const { assets }: Assets = await client.request(
    `
    query Assets($per_page: Int) {
      assets(first: $per_page) {
        id
        handle
        fileName
        grid: url(
          transformation: {
            image: {
              resize: { width: 300, height: 300, fit: crop }
              compress: { metadata: true }
              quality: { value: 90 }
            }
            document: { output: { format: autoImage } }
          }
        )
        publishedAt
        height
        width
        mimeType
        size
        alt
        tags
        createdBy {
          name
          picture
        }
      }
    }`,
    {
      per_page: 30,
    }
  );

  return assets;
}

export default async function Home() {
  const assets = await getAssets();
  const allTags: string[] = [];

  assets.forEach((asset) => {
    allTags.push(...asset.tags);
  });

  const tags = Array.from(new Set(allTags));

  return (
    <>
      <h1 className="text-4xl mb-2 font-bold">Hygraph stock library starter</h1>

      <ul className="mb-8">
        <li>
          <Link
            href="https://app.hygraph.com/clone/6b3636b3c7914fe5904fd41e364bc1cf?name=Asset%20Management%20Workshop"
            target="_blank"
            className="underline"
          >
            Clone the Hygraph project
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/hygraph/hygraph-stock-library-starter-next"
            target="_blank"
            className="underline"
          >
            Get the code for Next.js
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/hygraph/hygraph-stock-library-starter-nuxt"
            target="_blank"
            className="underline"
          >
            Get the code for NuxtJS
          </Link>
        </li>
      </ul>

      <ul className="flex flex-wrap">
        {tags.map((tag) => {
          return (
            <li key={tag}>
              <Link
                href={`/tag/${tag.toLocaleLowerCase()}`}
                className="block mr-1 mb-2 text-sm bg-slate-800 text-slate-100 py-2 px-4 rounded-md uppercase hover:bg-slate-600"
              >
                {tag}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-4 gap-4">
        {assets.map((asset: Asset) => {
          //@ts-ignore
          return <Card asset={asset} key={asset.id} />;
        })}
      </div>
    </>
  );
}
