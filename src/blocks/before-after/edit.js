import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";

import { Button } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const { beforeImage = {}, afterImage = {} } = attributes;

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

      {beforeImage.url && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={beforeImage.url}
            alt={beforeImage.alt || "Zdjęcie przed"}
            style={{
              display: "block",
              width: "100%",
              maxWidth: "500px",
              height: "auto",
              borderRadius: "8px",
            }}
          />
        </div>
      )}

      <MediaUploadCheck>
        <MediaUpload
          allowedTypes={["image"]}
          value={afterImage.id}
          onSelect={(media) =>
            setAttributes({
              afterImage: {
                id: media.id,
                url: media.url,
                alt: media.alt || "",
              },
            })
          }
          render={({ open }) => (
            <Button variant="primary" onClick={open}>
              {afterImage.url ? "Zmień zdjęcie PO" : "Wybierz zdjęcie PO"}
            </Button>
          )}
        />
      </MediaUploadCheck>

      {afterImage.url && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={afterImage.url}
            alt={afterImage.alt || "Zdjęcie po"}
            style={{
              display: "block",
              width: "100%",
              maxWidth: "500px",
              height: "auto",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </div>
  );
}
