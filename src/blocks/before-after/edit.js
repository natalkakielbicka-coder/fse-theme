import { useBlockProps } from "@wordpress/block-editor";

export default function Edit() {
  return (
    <div {...useBlockProps()}>
      <h3>FSE — Before / After</h3>
      <p>Wybierz dwa zdjęcia do porównania.</p>
    </div>
  );
}
