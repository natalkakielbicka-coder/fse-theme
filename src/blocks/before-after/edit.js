import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";

import { Button } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const { beforeImage = {} } = attributes;

  return (
    <div {...useBlockProps()}>
      <h3>FSE — Before / After</h3>

      <MediaUploadCheck>
        <MediaUpload
          allowedTypes={["image"]}
          value={beforeImage.id}
          onSelect={(media) =>
            setAttributes({
              beforeImage: {
                id: media.id,
                url: media.url,
                alt: media.alt || "",
              },
            })
          }
          render={({ open }) => (
            <Button variant="primary" onClick={open}>
              {beforeImage.url
                ? "Zmień zdjęcie PRZED"
                : "Wybierz zdjęcie PRZED"}
            </Button>
          )}
        />
      </MediaUploadCheck>
    </div>
  );
}
