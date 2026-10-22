import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";

import { Button, RangeControl } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const { beforeImage = {}, afterImage = {}, position = 50 } = attributes;

  return (
    <div {...useBlockProps()}>
      <h3>FSE — Before / After</h3>

      <div className="fse-before-after__preview">
        <div>
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
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </div>

        <div>
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
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {beforeImage.url && afterImage.url && (
        <div
          className="fse-before-after__comparison"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden",
            marginTop: "20px",
            borderRadius: "12px",
          }}
        >
          <img
            src={afterImage.url}
            alt={afterImage.alt || "Zdjęcie po"}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <img
            src={beforeImage.url}
            alt={beforeImage.alt || "Zdjęcie przed"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              clipPath: `inset(0 ${100 - position}% 0 0)`,
            }}
          />
        </div>
      )}

      {/* Suwak porównania zdjęć */}
      <div style={{ marginTop: "24px" }}>
        <RangeControl
          label="Pozycja podziału zdjęć"
          value={position}
          onChange={(value) => setAttributes({ position: value })}
          min={0}
          max={100}
          step={1}
          __nextHasNoMarginBottom
        />
      </div>
    </div>
  );
}
