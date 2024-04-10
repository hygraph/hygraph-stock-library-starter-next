import Link from "next/link";
import Card from "@/components/Card";
import { GraphQLClient } from "graphql-request";

type Asset = {
  id: string;
  handle: string;
  fileName: string;
  grid: string;
  publishedAt: string;
  height: number | string;
  width: number | string;
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

async function getAssetsForTag(tag: [string]) {
  //@ts-ignore
  const client = new GraphQLClient(process.env.NEXT_HYGRAPH_ENDPOINT);

  const { assets }: Assets = await client.request(
    `
    query AssetsForTag($tag: [String!]) {
      assets(where: {tags_contains_some: $tag}) {
        id
        handle
        fileName
        grid: url(
          transformation: {
            image: {
              resize: { width: 300, height: 300, fit: crop }
            }
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
      tag,
    }
  );

  return assets;
}

export default async function Tag({ params }: { params: { tag: string } }) {
  const assets = await getAssetsForTag([params.tag]);

  return (
    <>
      <p className="mb-8">
        <Link href="/" className="underline text-xs uppercase">
          Back to index
        </Link>
      </p>
      <h1 className="text-4xl mb-8 font-bold">
        Stock images for: {params.tag}
      </h1>

      <div className="grid grid-cols-4 gap-4">
        {assets.map((asset: Asset) => {
          //@ts-ignore
          return <Card asset={asset} key={asset.id} />;
        })}
      </div>
    </>
  );
}
