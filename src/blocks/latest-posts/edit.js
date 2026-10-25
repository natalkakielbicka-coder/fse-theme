import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

import { useEntityRecords, useEntityRecord } from "@wordpress/core-data";

import {
  Spinner,
  Notice,
  PanelBody,
  RangeControl,
  SelectControl,
} from "@wordpress/components";

function PostThumbnail({ mediaId }) {
  const {
    record: media,
    isResolving,
    status,
  } = useEntityRecord("postType", "attachment", mediaId, {
    enabled: Boolean(mediaId),
  });

  if (!mediaId) {
    return null;
  }

  if (status === "ERROR") {
    return null;
  }

  if (isResolving) {
    return <div className="fse-latest-posts__image">Ładowanie zdjęcia...</div>;
  }

  const imageUrl =
    media?.media_details?.sizes?.medium_large?.source_url || media?.source_url;

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="fse-latest-posts__image">
      <img src={imageUrl} alt={media?.alt_text || ""} />
    </div>
  );
}

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
      <div className="fse-latest-posts__grid">
        {posts.map((post) => {
          return (
            <article key={post.id} className="fse-latest-posts__card">
              <PostThumbnail mediaId={post.featured_media} />

              <div className="fse-latest-posts__content">
                <time className="fse-latest-posts__date" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("pl-PL")}
                </time>

                <h3 className="fse-latest-posts__title">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: post.title?.rendered || "(Bez tytułu)",
                    }}
                  />
                </h3>

                <span className="fse-latest-posts__more">Czytaj więcej →</span>
              </div>
            </article>
          );
        })}
      </div>
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
