document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wp-block-fse-theme-tabs").forEach((block) => {
    const buttons = block.querySelectorAll(".fse-tabs__button");
    const panels = block.querySelectorAll(".fse-tabs__panel");

    const activateTab = (activeIndex) => {
      buttons.forEach((button, index) => {
        const isActive = index === activeIndex;

        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;

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
