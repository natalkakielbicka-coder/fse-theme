import { useBlockProps } from "@wordpress/block-editor";

export default function save() {
  return (
    <div {...useBlockProps.save()}>
      <h3>API Greeting</h3>
      <p>Cześć! To mój pierwszy blok REST API.</p>
    </div>
  );
}
