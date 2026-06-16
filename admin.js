const STORAGE_KEYS = {
  repo: "narisuyu_admin_repo",
  branch: "narisuyu_admin_branch",
  token: "narisuyu_admin_token"
};

const DEFAULTS = {
  repo: "gimmartyn1985-lgtm/narisuyu-o",
  branch: "main"
};

const transliterationMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
  ь: "",
  ъ: ""
};

const elements = {
  accessBadge: document.querySelector("#access-badge"),
  accessForm: document.querySelector("#access-form"),
  repoField: document.querySelector("#repo-field"),
  branchField: document.querySelector("#branch-field"),
  tokenField: document.querySelector("#token-field"),
  clearAccessButton: document.querySelector("#clear-access"),
  accessStatus: document.querySelector("#access-status"),
  workForm: document.querySelector("#work-form"),
  imageField: document.querySelector("#image-field"),
  titleField: document.querySelector("#title-field"),
  metaField: document.querySelector("#meta-field"),
  altField: document.querySelector("#alt-field"),
  publishButton: document.querySelector("#publish-button"),
  publishStatus: document.querySelector("#publish-status"),
  previewEmpty: document.querySelector("#preview-empty"),
  previewImage: document.querySelector("#preview-image"),
  previewTitle: document.querySelector("#preview-title"),
  previewMeta: document.querySelector("#preview-meta"),
  worksCount: document.querySelector("#works-count"),
  worksList: document.querySelector("#works-list")
};

let currentWorks = [];

function updateAccessBadge() {
  if (elements.tokenField.value.trim()) {
    elements.accessBadge.textContent = "Токен сохранен";
    elements.accessBadge.classList.add("admin-badge-ready");
  } else {
    elements.accessBadge.textContent = "Токен не сохранен";
    elements.accessBadge.classList.remove("admin-badge-ready");
  }
}

function setMessage(target, text, tone = "neutral") {
  target.textContent = text;
  target.dataset.tone = tone;
}

function readSettings() {
  return {
    repo: elements.repoField.value.trim() || DEFAULTS.repo,
    branch: elements.branchField.value.trim() || DEFAULTS.branch,
    token: elements.tokenField.value.trim()
  };
}

function saveSettings() {
  const settings = readSettings();
  localStorage.setItem(STORAGE_KEYS.repo, settings.repo);
  localStorage.setItem(STORAGE_KEYS.branch, settings.branch);

  if (settings.token) {
    localStorage.setItem(STORAGE_KEYS.token, settings.token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  updateAccessBadge();
}

function loadSavedSettings() {
  elements.repoField.value = localStorage.getItem(STORAGE_KEYS.repo) || DEFAULTS.repo;
  elements.branchField.value = localStorage.getItem(STORAGE_KEYS.branch) || DEFAULTS.branch;
  elements.tokenField.value = localStorage.getItem(STORAGE_KEYS.token) || "";
  updateAccessBadge();
}

function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.token);
  elements.tokenField.value = "";
  updateAccessBadge();
  setMessage(elements.accessStatus, "Токен очищен на этом устройстве.", "neutral");
}

function updatePreviewText() {
  elements.previewTitle.textContent = elements.titleField.value.trim() || "Новая работа";
  elements.previewMeta.textContent =
    elements.metaField.value.trim() || "Подпись появится здесь после заполнения формы.";
}

function setPreviewImage(dataUrl, altText) {
  elements.previewImage.src = dataUrl;
  elements.previewImage.alt = altText || "";
  elements.previewImage.hidden = false;
  elements.previewEmpty.hidden = true;
}

function clearPreviewImage() {
  elements.previewImage.src = "";
  elements.previewImage.alt = "";
  elements.previewImage.hidden = true;
  elements.previewEmpty.hidden = false;
}

function handleImageSelection() {
  const [file] = elements.imageField.files;
  if (!file) {
    clearPreviewImage();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setPreviewImage(reader.result, elements.altField.value.trim());
  };
  reader.readAsDataURL(file);
}

function transliterate(value) {
  return value
    .toLowerCase()
    .split("")
    .map((char) => transliterationMap[char] ?? char)
    .join("");
}

function slugify(value) {
  const transliterated = transliterate(value);
  const slug = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "rabota";
}

function createTimestamp() {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ];

  return `${parts[0]}${parts[1]}${parts[2]}-${parts[3]}${parts[4]}${parts[5]}`;
}

function getFileExtension(file) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();
  if (extensionFromName && extensionFromName !== file.name.toLowerCase()) {
    return extensionFromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function bytesToBase64(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function stringToBase64(value) {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64ToString(base64Value) {
  const cleanValue = base64Value.replace(/\s+/g, "");
  const binary = atob(cleanValue);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}

async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  let message = "Ошибка GitHub API";

  try {
    const errorData = await response.json();
    message = errorData.message || message;
  } catch (error) {
    message = response.statusText || message;
  }

  throw new Error(message);
}

async function fetchRemoteWorks(settings) {
  const contentsUrl = `https://api.github.com/repos/${settings.repo}/contents/works.json?ref=${encodeURIComponent(settings.branch)}`;

  const payload = await githubRequest(contentsUrl, settings.token, { method: "GET" });
  const parsed = JSON.parse(base64ToString(payload.content));
  const works = Array.isArray(parsed.works) ? parsed.works : [];

  return {
    sha: payload.sha,
    works
  };
}

async function uploadFileToGitHub(settings, file, title) {
  const extension = getFileExtension(file);
  const timestamp = createTimestamp();
  const fileName = `${timestamp}-${slugify(title)}.${extension}`;
  const filePath = `фото/${fileName}`;
  const contentsUrl = `https://api.github.com/repos/${settings.repo}/contents/${encodeURIComponent(filePath)}`;

  await githubRequest(contentsUrl, settings.token, {
    method: "PUT",
    body: JSON.stringify({
      message: `Add artwork image: ${title}`,
      content: await fileToBase64(file),
      branch: settings.branch
    })
  });

  return filePath;
}

async function updateWorksJson(settings, nextWorks, title, sha) {
  const contentsUrl = `https://api.github.com/repos/${settings.repo}/contents/works.json`;
  const body = JSON.stringify({
    message: `Add artwork: ${title}`,
    content: stringToBase64(`${JSON.stringify({ works: nextWorks }, null, 2)}\n`),
    branch: settings.branch,
    sha
  });

  return githubRequest(contentsUrl, settings.token, {
    method: "PUT",
    body
  });
}

function renderWorksList(works) {
  elements.worksCount.textContent = `Сейчас в каталоге ${works.length} ${works.length === 1 ? "работа" : works.length < 5 ? "работы" : "работ"}.`;

  if (!works.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "admin-empty";
    emptyState.textContent = "Работы еще не добавлены.";
    elements.worksList.replaceChildren(emptyState);
    return;
  }

  elements.worksList.replaceChildren(
    ...works.map((work) => {
      const article = document.createElement("article");
      article.className = "admin-work-card";

      const image = document.createElement("img");
      image.src = work.image;
      image.alt = work.alt;

      const title = document.createElement("strong");
      title.textContent = work.title;

      const meta = document.createElement("p");
      meta.textContent = work.meta;

      const path = document.createElement("code");
      path.textContent = work.image;

      article.append(image, title, meta, path);
      return article;
    })
  );
}

async function refreshLocalWorks() {
  try {
    const response = await fetch("works.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Не удалось загрузить works.json");
    }

    const data = await response.json();
    currentWorks = Array.isArray(data.works) ? data.works : [];
    renderWorksList(currentWorks);
  } catch (error) {
    console.error(error);
    setMessage(elements.publishStatus, "Не удалось прочитать локальный каталог работ.", "error");
    renderWorksList([]);
  }
}

function resetWorkForm() {
  elements.workForm.reset();
  updatePreviewText();
  clearPreviewImage();
}

async function handlePublish(event) {
  event.preventDefault();

  const settings = readSettings();
  const title = elements.titleField.value.trim();
  const meta = elements.metaField.value.trim();
  const alt = elements.altField.value.trim();
  const [file] = elements.imageField.files;

  if (!settings.token) {
    setMessage(elements.publishStatus, "Сначала сохрани GitHub token в блоке доступа выше.", "error");
    return;
  }

  if (!title || !meta || !alt || !file) {
    setMessage(elements.publishStatus, "Заполни название, подпись, описание и выбери изображение.", "error");
    return;
  }

  elements.publishButton.disabled = true;
  setMessage(elements.publishStatus, "Публикую работу в GitHub…", "neutral");

  try {
    const imagePath = await uploadFileToGitHub(settings, file, title);
    const nextWork = { title, meta, image: imagePath, alt };
    const remoteState = await fetchRemoteWorks(settings);
    const nextWorks = [nextWork, ...remoteState.works];
    const response = await updateWorksJson(settings, nextWorks, title, remoteState.sha);

    currentWorks = nextWorks;
    renderWorksList(currentWorks);
    resetWorkForm();

    const commitUrl = response.commit?.html_url;
    if (commitUrl) {
      elements.publishStatus.textContent = "";
      elements.publishStatus.dataset.tone = "success";
      elements.publishStatus.append("Работа опубликована. ");

      const link = document.createElement("a");
      link.href = commitUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Открыть коммит";

      elements.publishStatus.append(link);
      elements.publishStatus.append(".");
    } else {
      setMessage(elements.publishStatus, "Работа опубликована и скоро появится на сайте.", "success");
    }
  } catch (error) {
    console.error(error);
    setMessage(elements.publishStatus, `Не удалось опубликовать работу: ${error.message}`, "error");
  } finally {
    elements.publishButton.disabled = false;
  }
}

elements.accessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveSettings();
  setMessage(elements.accessStatus, "Доступ сохранен на этом устройстве.", "success");
});

elements.clearAccessButton.addEventListener("click", clearToken);
elements.imageField.addEventListener("change", handleImageSelection);
elements.titleField.addEventListener("input", updatePreviewText);
elements.metaField.addEventListener("input", updatePreviewText);
elements.altField.addEventListener("input", () => {
  if (!elements.previewImage.hidden) {
    elements.previewImage.alt = elements.altField.value.trim();
  }
});
elements.workForm.addEventListener("submit", handlePublish);

loadSavedSettings();
updatePreviewText();
refreshLocalWorks();
