const works = [
  {
    title: "Портрет кота",
    meta: "графитный рисунок по фото",
    image: "фото/IMG_6692.jpg",
    alt: "Графитный портрет кота с маленьким исходным фото в углу"
  },
  {
    title: "Девушка с лошадью",
    meta: "портрет человека и животного",
    image: "фото/IMG_6693.jpg",
    alt: "Графитный рисунок девушки рядом с лошадью"
  },
  {
    title: "Портрет лошади",
    meta: "графитный рисунок по фото",
    image: "фото/IMG_6694.jpg",
    alt: "Графитный рисунок лошади с маленьким референсом внизу"
  },
  {
    title: "Лошадь с венком",
    meta: "животные и детали характера",
    image: "фото/IMG_6695.jpg",
    alt: "Графитный портрет лошади с цветами на голове"
  },
  {
    title: "Собака и кот",
    meta: "парный портрет питомцев",
    image: "фото/IMG_6696.jpg",
    alt: "Графитный рисунок собаки и кота по двум фотографиям"
  },
  {
    title: "Пара по фото",
    meta: "портрет важного момента",
    image: "фото/IMG_6697.jpg",
    alt: "Слева исходная фотография пары, справа готовый графитный рисунок"
  },
  {
    title: "Девушка с котами",
    meta: "цветной карандаш и теплые оттенки",
    image: "фото/IMG_6699.jpg",
    alt: "Цветной рисунок девушки с тремя котами"
  }
];

const gallery = document.querySelector("#gallery");
const prevButton = document.querySelector("#carousel-prev");
const nextButton = document.querySelector("#carousel-next");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const closeButton = document.querySelector(".lightbox-close");

function renderGallery() {
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
  prevButton.disabled = gallery.scrollLeft <= 4;
  nextButton.disabled = gallery.scrollLeft >= maxScrollLeft - 4;
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

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".art-card");
  if (!card) return;
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

renderGallery();
updateCarouselButtons();
