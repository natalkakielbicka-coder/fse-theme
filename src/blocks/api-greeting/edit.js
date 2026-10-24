import { useBlockProps } from "@wordpress/block-editor";

export default function Edit() {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <h3>API Greeting</h3>
      <p>Cześć! To mój pierwszy blok REST API.</p>
    </div>
  );
}
