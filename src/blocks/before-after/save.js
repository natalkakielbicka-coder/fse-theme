import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
  const { beforeImage = {}, afterImage = {}, position = 50 } = attributes;

  if (!beforeImage.url || !afterImage.url) {
    return null;
  }

  return (
    <div {...useBlockProps.save()}>
      <div
        className="fse-before-after__images"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          borderRadius: "12px",
        }}
      >
        <img
          src={beforeImage.url}
          alt={beforeImage.alt || "Zdjęcie przed"}
          className="fse-before-after__before"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        />

        <img
          src={afterImage.url}
          alt={afterImage.alt || "Zdjęcie po"}
          className="fse-before-after__after"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}
