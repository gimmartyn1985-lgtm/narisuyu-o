const works = [
  {
    title: "Питомцы в цвете",
    meta: "цветной карандаш · по фото",
    category: "pets",
    image: "IMG_6674.jpg",
    alt: "Три портрета с котами и людьми в цветном карандаше"
  },
  {
    title: "Семейный портрет",
    meta: "графит · семья и питомец",
    category: "people",
    image: "IMG_6665.jpg",
    alt: "Семейный портрет с ребенком и собакой"
  },
  {
    title: "Портрет с хаски",
    meta: "цветной карандаш · питомец",
    category: "pets",
    image: "IMG_6666.jpg",
    alt: "Женщина обнимает собаку хаски"
  },
  {
    title: "Портреты людей",
    meta: "графит · подборка",
    category: "people",
    image: "IMG_6671.jpg",
    alt: "Коллаж портретов людей карандашом"
  },
  {
    title: "Девушка с котом",
    meta: "цветной карандаш · питомец",
    category: "pets",
    image: "IMG_6668.jpg",
    alt: "Девушка держит кота на руках"
  },
  {
    title: "Малыш",
    meta: "цветной карандаш · портрет",
    category: "people",
    image: "IMG_6667.jpg",
    alt: "Портрет маленького ребенка цветными карандашами"
  },
  {
    title: "Telegram-канал",
    meta: "блог · процесс и новости",
    category: "process",
    image: "IMG_6676.PNG",
    alt: "Скриншот Telegram-канала художницы"
  },
  {
    title: "Работа над заказами",
    meta: "блог · реакции подписчиков",
    category: "process",
    image: "IMG_6673.jpg",
    alt: "Скриншот поста Telegram о заказах"
  },
  {
    title: "Условия работы",
    meta: "блог · без предоплаты",
    category: "process",
    image: "IMG_6670.jpg",
    alt: "Скриншот с условиями работы художницы"
  }
];

const gallery = document.querySelector("#gallery");
const filterButtons = document.querySelectorAll(".filter-button");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const closeButton = document.querySelector(".lightbox-close");

function renderGallery(filter = "all") {
  const selectedWorks = filter === "all" ? works : works.filter((work) => work.category === filter);

  gallery.replaceChildren(
    ...selectedWorks.map((work, index) => {
      const card = document.createElement("button");
      card.className = "art-card";
      card.type = "button";
      card.dataset.index = String(works.indexOf(work));
      card.setAttribute("aria-label", `Открыть работу: ${work.title}`);

      const image = document.createElement("img");
      image.src = work.image;
      image.alt = work.alt;
      image.loading = index < 3 ? "eager" : "lazy";

      const meta = document.createElement("span");
      meta.className = "art-meta";

      const label = document.createElement("span");
      label.textContent = work.category === "process" ? "из блога" : "портфолио";

      const title = document.createElement("strong");
      title.textContent = work.title;

      const details = document.createElement("em");
      details.textContent = work.meta;

      meta.append(label, title, details);
      card.append(image, meta);

      return card;
    })
  );
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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderGallery(button.dataset.filter);
  });
});

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".art-card");
  if (!card) return;
  openLightbox(works[Number(card.dataset.index)]);
});

closeButton.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});

renderGallery();
