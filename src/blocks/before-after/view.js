const initBeforeAfter = () => {
  document
    .querySelectorAll(".wp-block-fse-theme-before-after")
    .forEach((block) => {
      const range = block.querySelector(".fse-before-after__range");
      const before = block.querySelector(".fse-before-after__before");
      const divider = block.querySelector(".fse-before-after__divider");
      const handle = block.querySelector(".fse-before-after__handle");

      const beforeLabel = block.querySelector(
        ".fse-before-after__label--before",
      );

      const afterLabel = block.querySelector(".fse-before-after__label--after");

      if (!range || !before || !divider) {
        return;
      }

      const updatePosition = () => {
        const position = Math.max(0, Math.min(100, Number(range.value)));

        // Aktualizacja widoczności zdjęcia PRZED
        before.style.clipPath = `inset(0 ${100 - position}% 0 0)`;

        // Aktualizacja linii i uchwytu
        divider.style.left = `${position}%`;

        if (handle) {
          const handleWidth = handle.getBoundingClientRect().width;
          const containerWidth = range.getBoundingClientRect().width;

          if (containerWidth > 0) {
            const halfHandle = handleWidth / 2;

            const handleCenter = Math.max(
              halfHandle,
              Math.min(
                containerWidth - halfHandle,
                (position / 100) * containerWidth,
              ),
            );

            handle.style.left = `${handleCenter - (position / 100) * containerWidth}px`;
            handle.style.transform = "translate(-50%, -50%)";
          }
        }

        // Ukrywanie etykiet na krańcach
        if (beforeLabel) {
          beforeLabel.hidden = position === 0;
        }

        if (afterLabel) {
          afterLabel.hidden = position === 100;
        }
      };

      range.addEventListener("input", updatePosition);

      updatePosition();
    });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBeforeAfter);
} else {
  initBeforeAfter();
}
