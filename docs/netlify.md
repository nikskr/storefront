# Публикация сайта на Netlify

Netlify берёт код из репозитория на GitHub и публикует сайт при каждом push в ветку `main`. Настройки сборки уже лежат в `netlify.toml`, вводить их вручную не нужно.

## Шаг 1. Залить проект на GitHub

1. Зарегистрируйтесь на [github.com](https://github.com), если аккаунта ещё нет.
2. Создайте репозиторий: **New repository**, имя например `agro`, видимость **Private** или **Public**.
   Галочки «Add README», «.gitignore», «license» не ставьте: эти файлы уже есть в проекте.
3. В терминале в папке проекта:

   ```sh
   git add .
   git commit -m "chore: project setup"
   git remote add origin https://github.com/<ваш-логин>/agro.git
   git push -u origin main
   ```

   Перед коммитом сработает хук lint-staged, перед push — тесты.

## Шаг 2. Создать проект на Netlify

1. Зайдите на [app.netlify.com](https://app.netlify.com) и войдите через GitHub (так проще всего связать аккаунты).
2. Нажмите **Add new project → Import an existing project**.
3. Выберите **GitHub** и разрешите Netlify доступ. Можно дать доступ только к репозиторию `agro`.
4. Выберите репозиторий `agro`.

## Шаг 3. Проверить настройки сборки

Netlify сам прочитает `netlify.toml` и заполнит поля:

| Поле              | Значение            |
| ----------------- | ------------------- |
| Branch to deploy  | `main`              |
| Build command     | `npm run build`     |
| Publish directory | `dist`              |
| Functions         | `netlify/functions` |

Ничего не меняйте.

## Шаг 4. Добавить секреты бота

Добавить их можно прямо на этом экране (**Add environment variables**) или позже: **Project configuration → Environment variables → Add a variable**.

| Ключ                 | Значение                                            |
| -------------------- | --------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | токен бота (см. [telegram-bot.md](telegram-bot.md)) |
| `TELEGRAM_CHAT_ID`   | ID чата продавца                                    |

- Отметьте **Contains secret values**: Netlify скроет значения в интерфейсе и логах.
- В **Scopes** достаточно **Functions**.
- В **Deploy contexts** выберите **Production**. Тогда предпросмотры веток и pull request не будут слать тестовые заказы продавцу: функция без переменных вернёт понятную ошибку. Если хотите проверять заказы и в предпросмотрах, задайте для **Deploy Previews** значения тестового бота.

> После изменения переменных сайт нужно опубликовать заново: **Deploys → Trigger deploy → Deploy project**.

## Шаг 5. Опубликовать

1. Нажмите **Deploy**. Через минуту-две сайт будет доступен по адресу вида `https://random-name-123.netlify.app`.
2. Поменяйте адрес на понятный: **Project configuration → General → Change project name**, например `zelenaya-gryadka` → `https://zelenaya-gryadka.netlify.app`.
3. Впишите итоговый адрес в `src/data/site.ts` (поле `url`), закоммитьте и сделайте push. Без этого превью ссылок в мессенджерах не покажут картинку.

## Как это работает дальше

- **Push в `main`** → Netlify собирает и публикует сайт автоматически.
- **Pull request** → Netlify делает отдельный предпросмотр (Deploy Preview) по своей ссылке, основной сайт не меняется.
- Если сборка упала, опубликованным остаётся предыдущий рабочий вариант. Лог ошибки: **Deploys → нужная сборка**.

## Свой домен (по желанию)

Если купите домен (например, `zelenaya-gryadka.by`): **Domain management → Add a domain**, затем пропишите у регистратора DNS-записи, которые покажет Netlify. HTTPS-сертификат Netlify выпустит бесплатно. После этого обновите `url` в `src/data/site.ts`.

## Альтернатива: через терминал

```sh
npx netlify login
npx netlify init
```

`netlify init` создаст проект и свяжет его с репозиторием, задав те же вопросы. Переменные можно добавить командой `npx netlify env:set TELEGRAM_BOT_TOKEN <значение> --context production --secret`.
