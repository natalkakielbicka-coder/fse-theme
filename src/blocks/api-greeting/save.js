import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
  const { name } = attributes;

  return (
    <div {...useBlockProps.save()}>
      <h3>API Greeting</h3>
      <p>Cześć, {name}!</p>
    </div>
  );
}
