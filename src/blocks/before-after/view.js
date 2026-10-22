const initBeforeAfter = () => {
  document
    .querySelectorAll(".wp-block-fse-theme-before-after")
    .forEach((block) => {
      const range = block.querySelector(".fse-before-after__range");
      const before = block.querySelector(".fse-before-after__before");
      const divider = block.querySelector(".fse-before-after__divider");

      if (!range || !before || !divider) {
        return;
      }

      const updatePosition = () => {
        const position = Number(range.value);

        before.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
        divider.style.left = `${position}%`;
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
