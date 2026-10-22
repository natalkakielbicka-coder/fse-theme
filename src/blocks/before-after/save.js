import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
  const { beforeImage = {}, afterImage = {} } = attributes;

  if (!beforeImage.url || !afterImage.url) {
    return null;
  }

  return (
    <div {...useBlockProps.save()}>
      <div className="fse-before-after__images">
        <img
          src={beforeImage.url}
          alt={beforeImage.alt || "Zdjęcie przed"}
          className="fse-before-after__before"
        />

        <img
          src={afterImage.url}
          alt={afterImage.alt || "Zdjęcie po"}
          className="fse-before-after__after"
        />
      </div>
    </div>
  );
}
