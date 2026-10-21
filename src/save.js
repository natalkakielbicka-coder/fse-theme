import { useBlockProps } from "@wordpress/block-editor";

export default function save() {
  return (
    <div {...useBlockProps.save()}>
      <h3>FSE — Tabs</h3>
      <p>Mój pierwszy blok React!</p>
    </div>
  );
}
