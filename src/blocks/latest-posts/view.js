function createPostCard(post, settings) {
  const item = document.createElement("div");
  item.className = "fse-latest-posts__item";

  const card = document.createElement("article");
  card.className = `fse-latest-posts__card fse-latest-posts__card--${settings.layout}`;

  // Miniatura wpisu
  const image = post._embedded?.["wp:featuredmedia"]?.[0];

  if (settings.showImage && image?.source_url) {
    const imageLink = document.createElement("a");
    imageLink.className = "fse-latest-posts__image";
    imageLink.href = post.link;
    imageLink.tabIndex = -1;
    imageLink.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.src =
      image.media_details?.sizes?.medium_large?.source_url || image.source_url;
    img.alt = "";
    img.loading = "lazy";

    imageLink.appendChild(img);
    card.appendChild(imageLink);
  }

  const content = document.createElement("div");
  content.className = "fse-latest-posts__content";

  // Kategoria i data
  const meta = document.createElement("div");
  meta.className = "fse-latest-posts__meta";

  const terms = post._embedded?.["wp:term"]?.flat() || [];

  const category = terms.find(
    (term) =>
      term.taxonomy === "category" && post.categories?.includes(term.id),
  );

  if (category) {
    const badge = document.createElement("span");
    badge.className = "fse-latest-posts__category";
    badge.textContent = category.name;
    meta.appendChild(badge);
  }

  if (settings.showDate) {
    const date = document.createElement("time");
    date.className = "fse-latest-posts__date";
    date.dateTime = post.date;
    date.textContent = new Date(post.date).toLocaleDateString("pl-PL");

    meta.appendChild(date);
  }

  content.appendChild(meta);

  // Tytuł
  const heading = document.createElement("h3");
  heading.className = "fse-latest-posts__title";

  const titleLink = document.createElement("a");
  titleLink.href = post.link;

  // Zamieniamy HTML z API na zwykły tekst.
  const titleDocument = new DOMParser().parseFromString(
    post.title?.rendered || "(Bez tytułu)",
    "text/html",
  );

  titleLink.textContent = titleDocument.body.textContent;

  heading.appendChild(titleLink);
  content.appendChild(heading);

  // Opis
  if (settings.showExcerpt && post.excerpt?.rendered) {
    const excerpt = document.createElement("div");
    excerpt.className = "fse-latest-posts__excerpt";

    const excerptDocument = new DOMParser().parseFromString(
      post.excerpt.rendered,
      "text/html",
    );

    const text = excerptDocument.body.textContent.trim();
    const words = text.split(/\s+/);

    excerpt.textContent =
      words.length > 20 ? words.slice(0, 20).join(" ") + "…" : text;

    content.appendChild(excerpt);
  }

  // Czytaj więcej
  const more = document.createElement("a");
  more.className = "fse-latest-posts__more";
  more.href = post.link;
  more.textContent = "Czytaj więcej →";

  content.appendChild(more);
  card.appendChild(content);
  item.appendChild(card);

  return item;
}

document
  .querySelectorAll(
    ".wp-block-fse-theme-latest-posts .fse-latest-posts__pagination",
  )
  .forEach((pagination) => {
    const block = pagination.closest(".wp-block-fse-theme-latest-posts");

    const grid = block?.querySelector(".fse-latest-posts__grid");

    if (!grid) return;

    const settings = {
      layout:
        pagination.dataset.cardLayout === "horizontal"
          ? "horizontal"
          : "vertical",
      showImage: pagination.dataset.showImage !== "0",
      showDate: pagination.dataset.showDate !== "0",
      showExcerpt: pagination.dataset.showExcerpt !== "0",
    };

    const button = pagination.querySelector(".fse-latest-posts__load-more");

    const status = pagination.querySelector(".fse-latest-posts__status");

    if (!button || !status) return;

    let currentPage = Number(pagination.dataset.page) || 1;

    const totalPages = Number(pagination.dataset.totalPages);
    const perPage = Number(pagination.dataset.perPage);
    const categoryId = Number(pagination.dataset.category);
    const orderBy = pagination.dataset.orderBy;
    const order = pagination.dataset.order;

    button.addEventListener("click", async () => {
      const nextPage = currentPage + 1;

      if (nextPage > totalPages) return;

      button.disabled = true;
      button.textContent = "Ładowanie...";
      status.textContent = "";

      try {
        const url = new URL(pagination.dataset.apiUrl);

        url.searchParams.set("page", String(nextPage));
        url.searchParams.set("per_page", String(perPage));
        url.searchParams.set("orderby", orderBy);
        url.searchParams.set("order", order);
        url.searchParams.set("_embed", "1");

        if (categoryId > 0) {
          url.searchParams.set("categories", String(categoryId));
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const posts = await response.json();

        const fragment = document.createDocumentFragment();

        posts.forEach((post) => {
          fragment.appendChild(createPostCard(post, settings));
        });

        grid.appendChild(fragment);

        console.log("Dodano wpisów:", posts.length);

        currentPage = nextPage;
        pagination.dataset.page = String(currentPage);

        status.textContent = `Pobrano ${posts.length} kolejnych wpisów.`;

        if (currentPage >= totalPages) {
          button.remove();
        } else {
          button.disabled = false;
          button.textContent = "Załaduj więcej";
        }
      } catch (error) {
        console.error("FSE Latest Posts:", error);

        status.textContent = "Nie udało się pobrać wpisów. Spróbuj ponownie.";

        button.disabled = false;
        button.textContent = "Spróbuj ponownie";
      }
    });
  });
