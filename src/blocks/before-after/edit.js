import { useRef } from "@wordpress/element";

import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
} from "@wordpress/block-editor";

import {
  Button,
  RangeControl,
  PanelBody,
  TextControl,
} from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const {
    beforeImage = {},
    afterImage = {},
    position = 50,
    beforeLabel = "PRZED",
    afterLabel = "PO",
  } = attributes;
  const dragging = useRef(false);

  const handlePointerMove = (event) => {
    if (!dragging.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    const newPosition = Math.min(100, Math.max(0, percentage));

    setAttributes({
      position: Math.round(newPosition),
    });
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title="Etykiety zdjęć">
          <TextControl
            label="Etykieta PRZED"
            value={beforeLabel}
            onChange={(value) => setAttributes({ beforeLabel: value })}
          />

          <TextControl
            label="Etykieta PO"
            value={afterLabel}
            onChange={(value) => setAttributes({ afterLabel: value })}
          />
        </PanelBody>
      </InspectorControls>

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
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) {
                return;
              }

              event.stopPropagation();
              event.preventDefault();

              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              handlePointerMove(event);
            }}
            onPointerMove={(event) => {
              if (!dragging.current) {
                return;
              }

              event.stopPropagation();
              handlePointerMove(event);
            }}
            onPointerUp={(event) => {
              dragging.current = false;

              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
            onLostPointerCapture={() => {
              dragging.current = false;
            }}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              marginTop: "20px",
              borderRadius: "12px",
              touchAction: "none",
              cursor: "ew-resize",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <img
              src={afterImage.url}
              alt={afterImage.alt || "Zdjęcie po"}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
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
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                clipPath: `inset(0 ${100 - position}% 0 0)`,
                userSelect: "none",
                pointerEvents: "none",
              }}
            />

            {/* Linia podziału i uchwyt */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${position}%`,
                width: "3px",
                background: "#fff",
                transform: "translateX(-50%)",
                pointerEvents: "none",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                  background: "#fff",
                  color: "#30292D",
                  borderRadius: "50%",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                ↔
              </span>
            </div>
          </div>
        )}

        {/* Etykiety zdjęć w edytorze */}
        {beforeLabel && (
          <span
            className="fse-before-after__label fse-before-after__label--before"
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              zIndex: 2,
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.92)",
              color: "#30292D",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              pointerEvents: "none",
            }}
          >
            {beforeLabel}
          </span>
        )}

        {afterLabel && (
          <span
            className="fse-before-after__label fse-before-after__label--after"
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              zIndex: 2,
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.92)",
              color: "#30292D",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              pointerEvents: "none",
            }}
          >
            {afterLabel}
          </span>
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
    </>
  );
}
