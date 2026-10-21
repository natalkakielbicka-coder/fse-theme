document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".wp-block-fse-theme-tabs").forEach((block) => {
    const buttons = block.querySelectorAll(".fse-tabs__button");
    const panels = block.querySelectorAll(".fse-tabs__panel");

    if (!buttons.length || buttons.length !== panels.length) {
      return;
    }

    const blockId = `fse-tabs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    buttons.forEach((button, index) => {
      const tabId = `${blockId}-tab-${index}`;
      const panelId = `${blockId}-panel-${index}`;

      button.id = tabId;
      button.setAttribute("aria-controls", panelId);

      panels[index].id = panelId;
      panels[index].setAttribute("aria-labelledby", tabId);
    });

    const activateTab = (activeIndex) => {
      buttons.forEach((button, index) => {
        const isActive = index === activeIndex;

        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;

        panels[index].hidden = !isActive;
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        activateTab(index);
      });

      button.addEventListener("keydown", (event) => {
        let nextIndex;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % buttons.length;
            break;

          case "ArrowLeft":
            nextIndex = (index - 1 + buttons.length) % buttons.length;
            break;

          case "Home":
            nextIndex = 0;
            break;

          case "End":
            nextIndex = buttons.length - 1;
            break;

          default:
            return;
        }

        event.preventDefault();

        activateTab(nextIndex);
        buttons[nextIndex].focus();
      });
    });

    if (buttons.length && buttons.length === panels.length) {
      activateTab(0);
    }
  });
});
