import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

import { useEntityRecords } from "@wordpress/core-data";

import {
  Spinner,
  Notice,
  PanelBody,
  RangeControl,
  SelectControl,
} from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
  const {
    postsToShow = 5,
    orderBy = "date",
    order = "desc",
    categoryId = 0,
  } = attributes;

  // Pobieranie kategorii WordPressa
  const {
    records: categories,
    isResolving: categoriesLoading,
    status: categoriesStatus,
  } = useEntityRecords("taxonomy", "category", {
    per_page: 100,
    orderby: "name",
    order: "asc",
  });

  // Parametry zapytania o wpisy
  const postsQuery = {
    per_page: postsToShow,
    orderby: orderBy,
    order,
    status: "publish",
    ...(categoryId > 0 ? { categories: categoryId } : {}),
  };

  // Pobieranie wpisów
  const {
    records: posts,
    isResolving: postsLoading,
    status: postsStatus,
  } = useEntityRecords("postType", "post", postsQuery);

  // Opcje wyboru kategorii
  const categoryOptions = [
    { label: "Wszystkie kategorie", value: "0" },
    ...(categories || []).map((category) => ({
      label: category.name,
      value: String(category.id),
    })),
  ];

  // Zmiana sortowania
  const handleSortingChange = (value) => {
    const [newOrderBy, newOrder] = value.split("-");

    setAttributes({
      orderBy: newOrderBy,
      order: newOrder,
    });
  };

  let content;

  if (postsStatus === "ERROR") {
    content = (
      <Notice status="error" isDismissible={false}>
        Nie udało się pobrać wpisów.
      </Notice>
    );
  } else if (postsLoading || postsStatus === "IDLE") {
    content = <Spinner />;
  } else if (!posts?.length) {
    content = <p>Brak wpisów w wybranej kategorii.</p>;
  } else {
    content = (
      <ul>
        {posts.map((post) => (
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

          <SelectControl
            label="Sortowanie wpisów"
            value={`${orderBy}-${order}`}
            options={[
              { label: "Od najnowszych", value: "date-desc" },
              { label: "Od najstarszych", value: "date-asc" },
              { label: "Tytuł A–Z", value: "title-asc" },
              { label: "Tytuł Z–A", value: "title-desc" },
            ]}
            onChange={handleSortingChange}
            __nextHasNoMarginBottom
          />

          {categoriesStatus === "ERROR" ? (
            <Notice status="error" isDismissible={false}>
              Nie udało się pobrać kategorii.
            </Notice>
          ) : (
            <SelectControl
              label="Kategoria wpisów"
              value={String(categoryId)}
              options={categoryOptions}
              onChange={(value) =>
                setAttributes({
                  categoryId: Number(value),
                })
              }
              disabled={categoriesLoading || categoriesStatus === "IDLE"}
              help={
                categoriesLoading
                  ? "Ładowanie kategorii..."
                  : "Wybierz kategorię do filtrowania wpisów."
              }
              __nextHasNoMarginBottom
            />
          )}
        </PanelBody>
      </InspectorControls>

      <div {...useBlockProps()}>
        <h3>Najnowsze wpisy</h3>
        {content}
      </div>
    </>
  );
}
