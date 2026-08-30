// blog/components/ArticleBlocks.tsx
import RichText from "./RichText";
import { resolveMediaUrl } from "../../../shared/resolveMediaUrl";
import type { ContentBlock } from "../blog.types";

export default function ArticleBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={block.id}
                className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mt-10 mb-4 first:mt-0"
              >
                <RichText text={block.text} />
              </h2>
            );

          case "paragraph":
            return (
              <p key={block.id} className="mb-6">
                <RichText text={block.text} />
              </p>
            );

          case "pullquote":
            return (
              <blockquote
                key={block.id}
                className="border-l-2 border-[#990200] pl-6 my-10 text-2xl leading-snug text-gray-900 font-medium"
              >
                <RichText text={block.quote} />
                {block.attribution && (
                  <footer className="mt-3 text-sm font-normal text-gray-500 not-italic">
                    — <RichText text={block.attribution} />
                  </footer>
                )}
              </blockquote>
            );

          case "listicle":
            return (
              <div key={block.id} className="mb-10">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-sm font-bold text-[#990200]">
                    {String(block.number).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    <RichText text={block.title} />
                  </h3>
                </div>
                {block.description && (
                  <p className="text-gray-700">
                    <RichText text={block.description} />
                  </p>
                )}
              </div>
            );

          case "image":
            return (
              <figure key={block.id} className="mb-10">
                <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={resolveMediaUrl(block.src)}
                    alt={block.caption ?? ""}
                    className="w-full h-auto object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-2.5 text-sm text-gray-400 text-center">
                    <RichText text={block.caption} />
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </>
  );
}