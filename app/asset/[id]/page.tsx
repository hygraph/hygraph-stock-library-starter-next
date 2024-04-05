import Link from "next/link";
import Image from "next/image";

import { GraphQLClient } from "graphql-request";
import prettyBytes from "pretty-bytes";

type Asset = {
  asset: {
    id: string;
    handle: string;
    fileName: string;
    original: string;
    hero: string;
    publishedAt: string;
    height: number;
    width: number;
    mimeType: string;
    size: number;
    alt: string;
    tags: string[];

    createdBy: {
      name: string;
      picture: string;
    };
  };
};

async function getAsset(id: string) {
  //@ts-ignore
  const client = new GraphQLClient(process.env.NEXT_HYGRAPH_ENDPOINT);

  const { asset }: Asset = await client.request(
    `
    query Asset($id: ID!) {
      asset(where: { id: $id }) {
        id
        handle
        fileName
        original: url
        hero: url(
          transformation: {
            image: {
              resize: { width: 1280 }
              compress: { metadata: true }
              quality: { value: 100 }
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
    }
    `,
    {
      id,
    }
  );

  return asset;
}

export default async function Asset({ params }: { params: { id: string } }) {
  const asset = await getAsset(params.id);

  const size = prettyBytes(asset?.size || 0);

  const dateString = new Date(asset?.publishedAt).toLocaleDateString("en-US", {
    dateStyle: "full",
  });

  return (
    <>
      <p className="mb-8">
        <Link href="/" className="underline text-xs uppercase">
          Back to index
        </Link>
      </p>

      <h1 className="text-4xl mb-1 font-bold">{asset?.alt}</h1>
      <p className="text-sm text-gray-500">
        {asset?.width}x{asset?.height}, {asset?.mimeType}, {size}
        <br />
        {dateString}
      </p>
      <ul className="flex space-x-1 my-4">
        {asset.tags.map((tag) => {
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

      <div className="flex justify-between mb-4">
        <div className="flex space-x-2 items-center">
          <Image
            src={asset?.createdBy?.picture}
            className="w-6 rounded-full"
            loading="lazy"
            width="50"
            height="50"
            alt={asset.alt}
          />
          <p className="font-bold">{asset?.createdBy?.name}</p>
        </div>

        <Link
          href={asset?.original}
          target="_blank"
          className="block text-sm bg-slate-800 text-slate-100 py-2 px-4 rounded-md uppercase hover:bg-slate-600"
        >
          Download original
        </Link>
      </div>

      <figure className="relative">
        <Image
          src={asset.hero}
          alt={asset?.alt || ""}
          width={asset?.width || 160}
          height={asset?.height || 90}
          loading="eager"
          className="block w-full h-auto rounded-md"
        />
        <figcaption className="text-gray-100 p-2 absolute bottom-0 left-0 w-full h-auto bg-gray-800/60">
          {asset?.fileName}
        </figcaption>
      </figure>
    </>
  );
}
