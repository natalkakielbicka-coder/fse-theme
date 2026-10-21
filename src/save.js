import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
  const { tabs = [] } = attributes;

  return (
    <div {...useBlockProps.save()}>
      <div className="fse-tabs__nav">
        {tabs.map((tab, index) => (
          <button key={index} type="button" className="fse-tabs__button">
            {tab.title}
          </button>
        ))}
      </div>

      <div className="fse-tabs__panels">
        {tabs.map((tab, index) => (
          <div key={index} className="fse-tabs__panel">
            <p>{tab.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
