# Базовая безопасность сайта

## Что уже сделано

- Внешние ссылки с `target="_blank"` используют `rel="noopener noreferrer"`.
- Галерея рендерится через DOM API и `textContent`, а не через HTML-строки.
- В `vercel.json` добавлены базовые security headers:
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Permissions-Policy`
  - `Strict-Transport-Security`
- Неиспользуемые исходные скриншоты перенесены в `_private-source/`.
- `_private-source/` исключен из Git и Vercel через `.gitignore` и `.vercelignore`.
- Markdown-документация исключена из Vercel через `.vercelignore`, чтобы служебные инструкции не публиковались как страницы.
- Публичные изображения пересохранены без XMP/EXIF-комментариев и лишнего описания `Screenshot`.
- На сайте нет форм, полей ввода, cookies, localStorage, sessionStorage и клиентских секретов.

## Важно после деплоя

Замените временный домен `https://narisuyu-o.vercel.app/` на реальный домен или фактическую ссылку Vercel в:

- `index.html`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `SEO.md`
- `vercel.json`

## CSP-хеш

В `vercel.json` есть CSP-хеш для встроенной Schema.org JSON-LD разметки.

Если менять содержимое блока:

```html
<script type="application/ld+json">
```

нужно пересчитать хеш и обновить `script-src` в `vercel.json`.

Команда:

```bash
node - <<'NODE'
const fs = require('fs');
const crypto = require('crypto');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
console.log('sha256-' + crypto.createHash('sha256').update(match[1]).digest('base64'));
NODE
```

## Что нельзя добавлять в публичную папку

- скриншоты переписок с личными данными
- адреса, телефоны, чеки, банковские данные
- исходные фото клиентов без согласия
- API-ключи, токены, `.env` файлы

## Яндекс Вебмастер

Не добавляйте случайный `yandex-verification`. Нужно вставлять только реальный код, который выдаст Яндекс Вебмастер для конкретного сайта.
