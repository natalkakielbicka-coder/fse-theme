import { useBlockProps } from "@wordpress/block-editor";
import { useEntityRecords } from "@wordpress/core-data";
import { Spinner, Notice } from "@wordpress/components";

export default function Edit() {
  const { records, isResolving, status } = useEntityRecords(
    "postType",
    "post",
    {
      per_page: 5,
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
    <div {...useBlockProps()}>
      <h3>Najnowsze wpisy</h3>
      {content}
    </div>
  );
}
