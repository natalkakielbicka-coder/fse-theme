import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

import { useEntityRecords, useEntityRecord } from "@wordpress/core-data";

import { RawHTML } from "@wordpress/element";

import {
  Spinner,
  Notice,
  PanelBody,
  RangeControl,
  SelectControl,
  ToggleControl,
  RadioControl,
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
    showImage = true,
    showDate = true,
    showExcerpt = true,
    columns = 3,
    cardLayout = "vertical",
    enableLoadMore = false,
    loadMoreMode = "button",
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
      <div
        className="fse-latest-posts__grid"
        style={{ "--fse-columns": columns }}
      >
        {posts.map((post) => {
          const firstCategory = categories?.find((category) =>
            post.categories?.includes(category.id),
          );
          return (
            <div className="fse-latest-posts__item" key={post.id}>
              <article
                key={post.id}
                className={`fse-latest-posts__card fse-latest-posts__card--${cardLayout}`}
              >
                {showImage && <PostThumbnail mediaId={post.featured_media} />}

                <div className="fse-latest-posts__content">
                  <div className="fse-latest-posts__meta">
                    {firstCategory && (
                      <span className="fse-latest-posts__category">
                        {firstCategory.name}
                      </span>
                    )}
                    {showDate && (
                      <time
                        className="fse-latest-posts__date"
                        dateTime={post.date}
                      >
                        {new Date(post.date).toLocaleDateString("pl-PL")}
                      </time>
                    )}
                  </div>

                  <h3 className="fse-latest-posts__title">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: post.title?.rendered || "(Bez tytułu)",
                      }}
                    />
                  </h3>

                  {showExcerpt && (
                    <div className="fse-latest-posts__excerpt">
                      {post.excerpt?.rendered ? (
                        <RawHTML>{post.excerpt.rendered}</RawHTML>
                      ) : (
                        <p>Brak opisu wpisu.</p>
                      )}
                    </div>
                  )}

                  <span className="fse-latest-posts__more">
                    Czytaj więcej →
                  </span>
                </div>
              </article>
            </div>
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

          <PanelBody title="Wygląd kart" initialOpen={true}>
            <ToggleControl
              label="Pokaż miniaturę"
              checked={showImage}
              onChange={(value) => setAttributes({ showImage: value })}
              __nextHasNoMarginBottom
            />

            <ToggleControl
              label="Pokaż datę"
              checked={showDate}
              onChange={(value) => setAttributes({ showDate: value })}
              __nextHasNoMarginBottom
            />

            <ToggleControl
              label="Pokaż opis"
              checked={showExcerpt}
              onChange={(value) => setAttributes({ showExcerpt: value })}
              __nextHasNoMarginBottom
            />

            <RangeControl
              label="Liczba kolumn"
              value={columns}
              onChange={(value) => setAttributes({ columns: value })}
              min={1}
              max={4}
            />

            <RadioControl
              label="Układ kart"
              selected={cardLayout}
              options={[
                {
                  label: "Pionowy – zdjęcie nad tekstem",
                  value: "vertical",
                },
                {
                  label: "Poziomy – zdjęcie obok tekstu",
                  value: "horizontal",
                },
              ]}
              onChange={(value) => setAttributes({ cardLayout: value })}
            />

            <ToggleControl
              label="Włącz przycisk Załaduj więcej"
              checked={enableLoadMore}
              onChange={(value) => setAttributes({ enableLoadMore: value })}
              __nextHasNoMarginBottom
            />

            {enableLoadMore && (
              <SelectControl
                label="Sposób ładowania wpisów"
                value={loadMoreMode}
                options={[
                  {
                    label: "Przycisk Załaduj więcej",
                    value: "button",
                  },
                  {
                    label: "Automatycznie podczas przewijania",
                    value: "auto",
                  },
                ]}
                onChange={(value) => setAttributes({ loadMoreMode: value })}
                __nextHasNoMarginBottom
              />
            )}
          </PanelBody>
        </PanelBody>
      </InspectorControls>

      <div {...useBlockProps()}>
        <h3>Najnowsze wpisy</h3>
        {content}
      </div>
    </>
  );
}
