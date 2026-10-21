document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wp-block-fse-theme-tabs").forEach((block) => {
    const buttons = block.querySelectorAll(".fse-tabs__button");
    const panels = block.querySelectorAll(".fse-tabs__panel");

    const activateTab = (activeIndex) => {
      buttons.forEach((button, index) => {
        const isActive = index === activeIndex;

        button.setAttribute("aria-pressed", String(isActive));
        panels[index].hidden = !isActive;
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activateTab(index));
    });

    if (buttons.length && buttons.length === panels.length) {
      activateTab(0);
    }
  });
});
