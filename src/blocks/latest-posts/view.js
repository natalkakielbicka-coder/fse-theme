/**
 * FSE Latest Posts — frontend AJAX
 *
 * Features:
 * - Load More via WordPress REST API
 * - Responsive post cards
 * - Featured images
 * - Categories, dates and excerpts
 * - Skeleton loading
 * - Error handling
 * - Accessibility
 */

// --------------------------------------------------
// 1. Create a post card
// --------------------------------------------------

function createPostCard(post, settings) {
  const item = document.createElement("div");
  item.className = "fse-latest-posts__item";

  const card = document.createElement("article");

  card.className = `fse-latest-posts__card fse-latest-posts__card--${settings.layout}`;

  // Featured image
  const image = post._embedded?.["wp:featuredmedia"]?.[0];

  if (settings.showImage && image?.source_url) {
    const imageLink = document.createElement("a");

    imageLink.className = "fse-latest-posts__image";
    imageLink.href = post.link;
    imageLink.tabIndex = -1;
    imageLink.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");

    const imageSizes = image.media_details?.sizes || {};

    const preferredImage =
      imageSizes.medium_large || imageSizes.medium || imageSizes.full;

    img.src = preferredImage?.source_url || image.source_url;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    // Wymiary pomagają przeglądarce zarezerwować miejsce.
    if (preferredImage?.width && preferredImage?.height) {
      img.width = preferredImage.width;
      img.height = preferredImage.height;
    }

    // Responsywne obrazy.
    const srcset = Object.values(imageSizes)
      .filter(
        (size) =>
          size.source_url && Number.isFinite(size.width) && size.width > 0,
      )
      .map((size) => `${size.source_url} ${size.width}w`)
      .join(", ");

    if (srcset) {
      img.srcset = srcset;

      img.sizes =
        "(max-width: 767px) 100vw, " + "(max-width: 1024px) 50vw, 33vw";
    }

    imageLink.appendChild(img);
    card.appendChild(imageLink);
  }

  // Content
  const content = document.createElement("div");
  content.className = "fse-latest-posts__content";

  // Category and date
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

  if (settings.showDate && post.date) {
    const date = document.createElement("time");

    date.className = "fse-latest-posts__date";
    date.dateTime = post.date;

    date.textContent = new Date(post.date).toLocaleDateString("pl-PL");

    meta.appendChild(date);
  }

  if (meta.childElementCount > 0) {
    content.appendChild(meta);
  }

  // Title
  const heading = document.createElement("h3");
  heading.className = "fse-latest-posts__title";

  const titleLink = document.createElement("a");
  titleLink.href = post.link;

  const titleDocument = new DOMParser().parseFromString(
    post.title?.rendered || "(Bez tytułu)",
    "text/html",
  );

  titleLink.textContent = titleDocument.body.textContent || "(Bez tytułu)";

  heading.appendChild(titleLink);
  content.appendChild(heading);

  // Excerpt
  if (settings.showExcerpt) {
    const excerpt = document.createElement("div");
    excerpt.className = "fse-latest-posts__excerpt";

    const excerptDocument = new DOMParser().parseFromString(
      post.excerpt?.rendered || "",
      "text/html",
    );

    const excerptText = excerptDocument.body.textContent?.trim() || "";

    if (excerptText) {
      const words = excerptText.split(/\s+/);

      excerpt.textContent =
        words.length > 20 ? `${words.slice(0, 20).join(" ")}…` : excerptText;

      content.appendChild(excerpt);
    }
  }

  // Read more
  const more = document.createElement("a");

  more.className = "fse-latest-posts__more";
  more.href = post.link;
  more.textContent = "Czytaj więcej →";

  content.appendChild(more);

  card.appendChild(content);
  item.appendChild(card);

  return item;
}

// --------------------------------------------------
// 2. Create a skeleton card
// --------------------------------------------------

function createSkeletonCard(settings) {
  const item = document.createElement("div");

  item.className = "fse-latest-posts__item fse-latest-posts__skeleton-item";

  item.setAttribute("aria-hidden", "true");

  const skeleton = document.createElement("div");

  skeleton.className = [
    "fse-latest-posts__skeleton",
    `fse-latest-posts__card--${settings.layout}`,
  ].join(" ");

  // Image placeholder
  if (settings.showImage) {
    const image = document.createElement("div");
    image.className = "fse-latest-posts__skeleton-image";

    skeleton.appendChild(image);
  }

  // Content placeholder
  const content = document.createElement("div");
  content.className = "fse-latest-posts__skeleton-content";

  const sizes = ["short", "", "medium", ""];

  sizes.forEach((size) => {
    const line = document.createElement("div");

    line.className = `fse-latest-posts__skeleton-line ${size}`.trim();

    content.appendChild(line);
  });

  skeleton.appendChild(content);
  item.appendChild(skeleton);

  return item;
}

// --------------------------------------------------
// 3. Initialize each block instance
// --------------------------------------------------

document
  .querySelectorAll(
    ".wp-block-fse-theme-latest-posts .fse-latest-posts__pagination",
  )
  .forEach((pagination) => {
    const block = pagination.closest(".wp-block-fse-theme-latest-posts");

    const grid = block?.querySelector(".fse-latest-posts__grid");

    const button = pagination.querySelector(".fse-latest-posts__load-more");

    const status = pagination.querySelector(".fse-latest-posts__status");

    if (!grid || !button || !status) {
      return;
    }

    // Block settings
    const settings = {
      layout:
        pagination.dataset.cardLayout === "horizontal"
          ? "horizontal"
          : "vertical",

      showImage: pagination.dataset.showImage !== "0",
      showDate: pagination.dataset.showDate !== "0",
      showExcerpt: pagination.dataset.showExcerpt !== "0",
    };

    let currentPage = Number(pagination.dataset.page) || 1;

    const totalPages = Number(pagination.dataset.totalPages);

    const perPage = Number(pagination.dataset.perPage);
    const categoryId = Number(pagination.dataset.category);

    const orderBy = pagination.dataset.orderBy || "date";
    const order = pagination.dataset.order || "desc";

    let isLoading = false;

    // ------------------------------------------
    // Load More + Infinite Scroll
    // ------------------------------------------

    const loadMode = pagination.dataset.loadMode || "button";

    const sentinel = pagination.querySelector(".fse-latest-posts__sentinel");

    let observer = null;
    let autoPaused = false;

    async function loadMore() {
      if (isLoading || currentPage >= totalPages) {
        return;
      }

      const nextPage = currentPage + 1;

      isLoading = true;

      // Zapobiegamy ponownemu wyzwoleniu obserwatora.
      observer?.unobserve(sentinel);

      button.disabled = true;
      button.textContent = "Ładowanie...";

      status.textContent = "";
      pagination.setAttribute("aria-busy", "true");

      const skeletons = [];
      const skeletonFragment = document.createDocumentFragment();

      for (let i = 0; i < perPage; i++) {
        const skeleton = createSkeletonCard(settings);

        skeletons.push(skeleton);
        skeletonFragment.appendChild(skeleton);
      }

      grid.appendChild(skeletonFragment);

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

        if (!Array.isArray(posts)) {
          throw new Error("Invalid API response");
        }

        if (posts.length === 0) {
          button.remove();
          observer?.disconnect();
          status.textContent = "Wszystkie wpisy załadowane.";
          return;
        }

        const postsFragment = document.createDocumentFragment();

        posts.forEach((post, index) => {
          const card = createPostCard(post, settings);

          card.classList.add("fse-latest-posts__item--enter");

          card.style.setProperty(
            "--fse-enter-delay",
            `${Math.min(index, 5) * 60}ms`,
          );

          postsFragment.appendChild(card);
        });

        skeletons.forEach((skeleton) => skeleton.remove());

        grid.appendChild(postsFragment);

        currentPage = nextPage;
        pagination.dataset.page = String(currentPage);

        status.textContent = `Pobrano ${posts.length} kolejnych wpisów.`;

        if (currentPage >= totalPages || posts.length < perPage) {
          button.remove();
          observer?.disconnect();
        } else {
          button.disabled = false;
          button.textContent = "Załaduj więcej";
        }
      } catch (error) {
        console.error("FSE Latest Posts:", error);

        status.textContent = "Nie udało się pobrać wpisów. Spróbuj ponownie.";

        button.disabled = false;
        button.textContent = "Spróbuj ponownie";

        // Po błędzie wyłączamy automatyczne ponawianie.
        // Użytkownik może użyć przycisku.
        autoPaused = true;
        observer?.disconnect();

        pagination.classList.add("fse-latest-posts__pagination--error");
      } finally {
        skeletons.forEach((skeleton) => skeleton.remove());

        pagination.removeAttribute("aria-busy");
        isLoading = false;

        // Wznawiamy automatyczne ładowanie po sukcesie.
        if (
          loadMode === "auto" &&
          !autoPaused &&
          currentPage < totalPages &&
          observer &&
          sentinel
        ) {
          observer.observe(sentinel);
        }
      }
    }

    // Ręczne ładowanie.
    button.addEventListener("click", () => {
      autoPaused = false;

      pagination.classList.remove("fse-latest-posts__pagination--error");

      loadMore();
    });

    // Automatyczne ładowanie podczas przewijania.
    if (loadMode === "auto" && sentinel && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (
            entry?.isIntersecting &&
            !isLoading &&
            !autoPaused &&
            currentPage < totalPages
          ) {
            loadMore();
          }
        },
        {
          root: null,
          rootMargin: "0px 0px 300px 0px",
          threshold: 0,
        },
      );

      observer.observe(sentinel);
    }

    if (loadMode === "auto" && !("IntersectionObserver" in window)) {
      sentinel?.remove();
    }
  });
