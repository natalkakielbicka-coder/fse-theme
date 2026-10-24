import { useBlockProps } from "@wordpress/block-editor";

export default function Edit() {
  return (
    <div {...useBlockProps()}>
      <h3>Najnowsze wpisy</h3>
      <p>Tutaj pojawi się lista wpisów WordPress.</p>
    </div>
  );
}
