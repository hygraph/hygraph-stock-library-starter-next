import Image from "next/image";
import Link from "next/link";

interface Props {
  asset: {
    id: string;
    fileName: string;
    grid: string;
    alt: string;
    width: string;
    height: string;
    createdBy: {
      name: string;
      picture: string;
    };
  };
}

export default function Card({ asset }: Props) {
  return (
    <figure className="hover:shadow-xl">
      <Link href={`/asset/${asset.id}`} className="block relative">
        <Image
          src={`${asset.grid}/${asset.fileName}`}
          alt="asset.alt"
          loading="lazy"
          width="300"
          height="300"
          className="w-full h-auto block hover:opacity-80 transition ease duration-500"
        />

        <figcaption className="text-gray-100 p-2 absolute bottom-0 left-0 w-full h-auto bg-gray-800/60">
          <p className="line-clamp-1 text-sm">{asset.alt}</p>
          <p className="text-xs text-gray-300">
            {asset.width}x{asset.height} &mdash;
            {asset.createdBy.name}
          </p>
        </figcaption>
      </Link>
    </figure>
  );
}
