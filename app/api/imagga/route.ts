import { GraphQLClient } from "graphql-request";
import { type NextRequest, NextResponse } from 'next/server'

type Asset = {
  asset: {
    id: string;
    fileName: string;
    url: string;
    tags: string[];
  };
};

const client = new GraphQLClient(
  //@ts-ignore
  process.env.NEXT_HYGRAPH_ENDPOINT as string,
  {
    //@ts-ignore
    headers: {
      Authorization: process.env.NEXT_HYGRAPH_TOKEN
    }
  }
);

async function getAssetById(id: string) {
  const { asset }: Asset = await client.request(
    `
    query Asset($id: ID!) {
      asset(where: { id: $id }) {
        url
        fileName
        id
        tags
      }
    }
    `,
    {
      id,
    }
  );

  return asset
}

async function getTagsFromImagga(url: string, fileName: string) {
  if (fileName.endsWith(".jpg") || fileName.endsWith(".png") || fileName.endsWith(".jpeg") || fileName.endsWith(".webp")) {
    const response = await fetch(`https://api.imagga.com/v2/tags?threshold=25&image_url=${url}`, {
      headers: {
        Authorization: process.env.NEXT_IMAGGA_TOKEN as string
      }
    })
    const resultJson = await response.json();
    return resultJson.result.tags
  }
  else {
    return []
  }
}

async function applyImaggaTags(imaggaTags: string[], assetTags: string[], assetId: string) {
  let shouldMutate = false;
  const treshold = 70

  imaggaTags.forEach((value: any) => {
    if (value.confidence >= treshold && !assetTags.includes(value.tag.en)) {
      assetTags.push(value.tag.en);
      shouldMutate = true;
    }
  });

  const mutation = `
    mutation AddAssetTags($id:ID!, $tags:[String!]) {
        updateAsset(
          data: { tags: $tags }
          where: { id: $id }
        ) {
          id
        }
      }
  `;

  if (shouldMutate) {
    await client.request(mutation, { id: assetId, tags: assetTags });
  }

  return "success"
}

async function updateTags(id: string) {
  const asset = await getAssetById(id)
  const tagsFromImagga = await getTagsFromImagga(asset.url, asset.fileName)

  return await applyImaggaTags(tagsFromImagga, asset.tags, asset.id)
}

export async function POST(request: NextRequest) {
  const req = await request.json();
  const { id } = req.data
  const message = await updateTags(id)
  return NextResponse.json({ message })
}

export async function GET() {
  return NextResponse.json({ "message": "go away" })
}