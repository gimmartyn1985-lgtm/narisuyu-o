let works = [];

const gallery = document.querySelector("#gallery");
const prevButton = document.querySelector("#carousel-prev");
const nextButton = document.querySelector("#carousel-next");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const closeButton = document.querySelector(".lightbox-close");

function renderEmptyGallery() {
  const emptyState = document.createElement("div");
  emptyState.className = "gallery-empty";
  emptyState.textContent = "Работы появятся здесь после первой публикации.";

  gallery.replaceChildren(emptyState);
}

function renderGallery() {
  if (!works.length) {
    renderEmptyGallery();
    return;
  }

  gallery.replaceChildren(
    ...works.map((work, index) => {
      const card = document.createElement("button");
      card.className = "art-card";
      card.type = "button";
      card.dataset.index = String(index);
      card.setAttribute("aria-label", `Открыть работу: ${work.title}`);

      const figure = document.createElement("div");
      figure.className = "art-figure";

      const image = document.createElement("img");
      image.src = work.image;
      image.alt = work.alt;
      image.loading = index < 3 ? "eager" : "lazy";
      figure.append(image);

      const meta = document.createElement("span");
      meta.className = "art-meta";

      const label = document.createElement("span");
      label.textContent = "портфолио";

      const title = document.createElement("strong");
      title.textContent = work.title;

      const details = document.createElement("em");
      details.textContent = work.meta;

      meta.append(label, title, details);
      card.append(figure, meta);

      return card;
    })
  );
}

function updateCarouselButtons() {
  const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth;
  const hasWorks = works.length > 0;

  prevButton.disabled = !hasWorks || gallery.scrollLeft <= 4;
  nextButton.disabled = !hasWorks || gallery.scrollLeft >= maxScrollLeft - 4;
}

function scrollGallery(direction) {
  const card = gallery.querySelector(".art-card");
  if (!card) return;

  const gap = 14;
  const amount = card.getBoundingClientRect().width + gap;

  gallery.scrollBy({
    left: amount * direction,
    behavior: "smooth"
  });
}

function openLightbox(work) {
  lightboxImage.src = work.image;
  lightboxImage.alt = work.alt;
  lightboxCaption.textContent = `${work.title} · ${work.meta}`;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  closeButton.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

async function loadWorks() {
  try {
    const response = await fetch("works.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Не удалось загрузить works.json");
    }

    const data = await response.json();
    works = Array.isArray(data.works) ? data.works : [];
  } catch (error) {
    console.error(error);
    works = [];
  }

  renderGallery();
  updateCarouselButtons();
}

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".art-card");
  if (!card || !works.length) return;
  openLightbox(works[Number(card.dataset.index)]);
});

gallery.addEventListener("scroll", updateCarouselButtons);

prevButton.addEventListener("click", () => scrollGallery(-1));
nextButton.addEventListener("click", () => scrollGallery(1));

closeButton.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});

loadWorks();
