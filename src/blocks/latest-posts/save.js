import { useBlockProps } from "@wordpress/block-editor";

export default function save() {
  return (
    <div {...useBlockProps.save()}>
      <h3>Najnowsze wpisy</h3>
      <p>Tutaj pojawi się lista wpisów WordPress.</p>
    </div>
  );
}
