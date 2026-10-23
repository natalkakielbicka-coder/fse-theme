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
        {/* Zdjęcie PO — warstwa dolna */}
        <img
          src={afterImage.url}
          alt={afterImage.alt || "Zdjęcie po"}
          className="fse-before-after__after"
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* Zdjęcie PRZED — warstwa górna */}
        <img
          src={beforeImage.url}
          alt={beforeImage.alt || "Zdjęcie przed"}
          className="fse-before-after__before"
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            clipPath: `inset(0 ${100 - position}% 0 0)`,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* Linia podziału */}
        <div
          className="fse-before-after__divider"
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
          }}
        >
          {/* Okrągły uchwyt */}
          <span
            className="fse-before-after__handle"
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

        {/* Etykiety zdjęć */}
        <span
          className="fse-before-after__label fse-before-after__label--before"
          aria-hidden="true"
        >
          PRZED
        </span>

        <span
          className="fse-before-after__label fse-before-after__label--after"
          aria-hidden="true"
        >
          PO
        </span>

        {/* Natywny suwak porównania */}
        <input
          type="range"
          className="fse-before-after__range"
          min="0"
          max="100"
          step="1"
          defaultValue={position}
          aria-label="Pozycja porównania zdjęć"
        />
      </div>
    </div>
  );
}
