import { registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";

registerBlockType(metadata.name, {
  edit: () => <p>FSE — Before / After działa!</p>,
  save: () => null,
});
