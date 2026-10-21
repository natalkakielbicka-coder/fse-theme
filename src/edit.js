import { useState } from "@wordpress/element";
import { useBlockProps } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";

export default function Edit() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Opis zakładki",
      content: "To jest zawartość pierwszej zakładki.",
    },
    {
      title: "Specyfikacja",
      content: "Tutaj znajdzie się specyfikacja produktu.",
    },
    {
      title: "FAQ",
      content: "Tutaj umieścimy najczęściej zadawane pytania.",
    },
  ];

  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <h3>Moje interaktywne zakładki</h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {tabs.map((tab, index) => (
          <Button
            key={index}
            variant={activeTab === index ? "primary" : "secondary"}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </Button>
        ))}
      </div>

      <div
        style={{
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "8px",
          color: "#222",
        }}
      >
        <h4>{tabs[activeTab].title}</h4>
        <p>{tabs[activeTab].content}</p>
      </div>
    </div>
  );
}
