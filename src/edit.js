import { useState } from "@wordpress/element";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
  Button,
  TextControl,
  TextareaControl,
  PanelBody,
  SelectControl,
} from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const { tabs = [], tabStyle = "underline" } = attributes;
  const [activeTab, setActiveTab] = useState(0);

  const addTab = () => {
    const updatedTabs = [
      ...tabs,
      {
        title: `Zakładka ${tabs.length + 1}`,
        content: "",
      },
    ];

    setAttributes({ tabs: updatedTabs });
    setActiveTab(updatedTabs.length - 1);
  };

  const removeTab = (index) => {
    if (tabs.length <= 1) {
      return;
    }

    const updatedTabs = tabs.filter((_, i) => i !== index);

    setAttributes({ tabs: updatedTabs });

    setActiveTab((current) => {
      if (current > index) {
        return current - 1;
      }

      if (current === index) {
        return Math.min(index, updatedTabs.length - 1);
      }

      return current;
    });
  };

  const moveTab = (direction) => {
    const newIndex = activeTab + direction;

    if (newIndex < 0 || newIndex >= tabs.length) {
      return;
    }

    const updatedTabs = [...tabs];

    [updatedTabs[activeTab], updatedTabs[newIndex]] = [
      updatedTabs[newIndex],
      updatedTabs[activeTab],
    ];

    setAttributes({ tabs: updatedTabs });
    setActiveTab(newIndex);
  };

  const updateTab = (index, field, value) => {
    const updatedTabs = tabs.map((tab, i) =>
      i === index ? { ...tab, [field]: value } : tab,
    );

    setAttributes({ tabs: updatedTabs });
  };

  const currentTab = tabs[activeTab];

  return (
    <>
      <InspectorControls>
        <PanelBody title="Ustawienia zakładek">
          <SelectControl
            label="Styl zakładek"
            value={tabStyle}
            options={[
              { label: "Podkreślenie", value: "underline" },
              { label: "Przyciski", value: "buttons" },
              { label: "Pigułki", value: "pills" },
            ]}
            onChange={(value) => setAttributes({ tabStyle: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div
        {...useBlockProps({
          className: `fse-tabs--${tabStyle}`,
        })}
      >
        <h3>FSE — Tabs</h3>

        <div className="fse-tabs__nav">
          {tabs.map((tab, index) => (
            <Button
              key={index}
              className="fse-tabs__button"
              aria-pressed={activeTab === index}
              variant={activeTab === index ? "primary" : "secondary"}
              onClick={() => setActiveTab(index)}
            >
              {tab.title}
            </Button>
          ))}

          <Button variant="tertiary" onClick={addTab}>
            + Dodaj zakładkę
          </Button>
        </div>

        {currentTab && (
          <div style={{ marginTop: "20px" }}>
            <TextControl
              label="Nazwa zakładki"
              value={currentTab.title}
              onChange={(value) => updateTab(activeTab, "title", value)}
            />

            <TextareaControl
              label="Treść zakładki"
              value={currentTab.content}
              onChange={(value) => updateTab(activeTab, "content", value)}
            />

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <Button
                variant="secondary"
                disabled={activeTab === 0}
                onClick={() => moveTab(-1)}
              >
                ← Przesuń w lewo
              </Button>

              <Button
                variant="secondary"
                disabled={activeTab === tabs.length - 1}
                onClick={() => moveTab(1)}
              >
                Przesuń w prawo →
              </Button>
            </div>

            <Button
              variant="secondary"
              isDestructive
              disabled={tabs.length <= 1}
              onClick={() => removeTab(activeTab)}
            >
              Usuń zakładkę
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
