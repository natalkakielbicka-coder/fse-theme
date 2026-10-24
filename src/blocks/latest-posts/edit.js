import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

import { useEntityRecords } from "@wordpress/core-data";

import {
  Spinner,
  Notice,
  PanelBody,
  RangeControl,
} from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const { postsToShow } = attributes;

  const { records, isResolving, status } = useEntityRecords(
    "postType",
    "post",
    {
      per_page: postsToShow,
      orderby: "date",
      order: "desc",
      status: "publish",
    },
  );

  let content;

  if (status === "ERROR") {
    content = (
      <Notice status="error" isDismissible={false}>
        Nie udało się pobrać wpisów.
      </Notice>
    );
  } else if (isResolving || status === "IDLE") {
    content = <Spinner />;
  } else if (!records?.length) {
    content = <p>Brak opublikowanych wpisów.</p>;
  } else {
    content = (
      <ul>
        {records.map((post) => (
          <li key={post.id}>{post.title?.rendered || "(Bez tytułu)"}</li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <InspectorControls>
        <PanelBody title="Ustawienia listy wpisów" initialOpen={true}>
          <RangeControl
            label="Liczba wpisów"
            value={postsToShow}
            onChange={(value) => setAttributes({ postsToShow: value })}
            min={1}
            max={10}
          />
        </PanelBody>
      </InspectorControls>

      <div {...useBlockProps()}>
        <h3>Najnowsze wpisy</h3>
        {content}
      </div>
    </>
  );
}
