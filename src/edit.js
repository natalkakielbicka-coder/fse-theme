import { useState } from "@wordpress/element";
import { useBlockProps } from "@wordpress/block-editor";
import { Button, TextControl, TextareaControl } from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const { tabs = [] } = attributes;
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
    setActiveTab(Math.min(activeTab, updatedTabs.length - 1));
  };

  const updateTab = (index, field, value) => {
    const updatedTabs = tabs.map((tab, i) =>
      i === index ? { ...tab, [field]: value } : tab,
    );

    setAttributes({ tabs: updatedTabs });
  };

  const currentTab = tabs[activeTab];

  return (
    <div {...useBlockProps()}>
      <h3>FSE — Tabs</h3>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {tabs.map((tab, index) => (
          <Button
            key={index}
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
  );
}
