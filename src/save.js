import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
  const { tabs = [] } = attributes;

  return (
    <div {...useBlockProps.save()}>
      {tabs.map((tab, index) => (
        <div key={index}>
          <h3>{tab.title}</h3>
          <p>{tab.content}</p>
        </div>
      ))}
    </div>
  );
}
