import { useBlockProps } from "@wordpress/block-editor";

export default function save() {
  return (
    <div {...useBlockProps.save()}>
      <h3>Moje interaktywne zakładki React</h3>
      <p>Mój pierwszy blok React!</p>
    </div>
  );
}
