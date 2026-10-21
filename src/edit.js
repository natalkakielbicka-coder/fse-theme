import { useBlockProps } from "@wordpress/block-editor";

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <h3>FSE — Tabs</h3>
      <p>Mój pierwszy blok React!</p>
    </div>
  );
}
