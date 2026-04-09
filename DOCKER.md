# Docker & Dokploy Setup

Полный стек DMR готов к запуску с Docker. Поддерживается локальное развитие и развертывание на Dokploy.

## Локальная разработка с Docker Compose

### Требования

- Docker Desktop (или Docker + Docker Compose)
- Git

### Быстрый старт

1. **Клонировать репозиторий:**

```bash
git clone <repo-url>
cd dmr
```

1. **Создать `.env` из шаблона:**

```bash
cp .env.docker .env
```

1. **Запустить стек:**

```bash
docker-compose up -d
```

Это запустит:

- **PostgreSQL** на порту 5432 (хост: `postgres`, пользователь: `postgres`, пароль: из `.env`)
- **API** на порту 3000 ([http://localhost:3000](http://localhost:3000))
- **Web** на порту 80 ([http://localhost](http://localhost))

1. **Проверить статус контейнеров:**

```bash
docker-compose ps
docker-compose logs -f api      # Смотреть логи API
docker-compose logs -f web      # Смотреть логи Web
```

1. **Остановить стек:**

```bash
docker-compose down
```

Для полной очистки (включая БД):

```bash
docker-compose down -v
```

### Доступ к приложениям

- **Публичное меню:** [http://localhost](http://localhost)
- **Админка:** [http://localhost/admin](http://localhost/admin) ([admin@demo.local](mailto:admin@demo.local) / admin123)
- **API Swagger:** [http://localhost:3000/api](http://localhost:3000/api)
- **Prisma Studio (БД GUI):** После остановки контейнеров запустить:
  ```bash
  cd apps/api && npx prisma studio
  ```

### Инициализация БД

Миграции запускаются автоматически при старте API-контейнера. Сидирование (создание языков, типов меню, админа) выполняется один раз:

```bash
docker-compose exec api npm run prisma:seed
```

Это создаст:

- Языки: ru, en, kk
- Типы меню: Main, Bar, Tea, Wine, Kids
- Админ-пользователя: **[admin@demo.local](mailto:admin@demo.local)** / **admin123**

### Управление БД

Подключиться к PostgreSQL напрямую:

```bash
docker-compose exec postgres psql -U postgres -d dmr
```

Просмотр логов API:

```bash
docker-compose logs -f api
```

Пересборка после изменения кода:

```bash
docker-compose up -d --build
```

## Развертывание на Dokploy

Dokploy — это самостоящее решение для развертывания Docker-приложений. Поддерживает GitHub, GitLab интеграцию.

### Подготовка

1. **Запустить Dokploy** на своем сервере или используйте облачный экземпляр
  - Документация: [https://dokploy.com](https://dokploy.com)
2. **Подготовить переменные окружения:**
  - Скопировать значения из `.env.docker`
  - Обновить чувствительные данные (пароли, API ключи)

### Создание сервисов в Dokploy

Dokploy работает с Docker Compose, так что просто загрузите или подключите репозиторий.

#### Вариант A: Загрузка docker-compose.yml в Dokploy UI

1. Перейти в Dokploy → Projects → Create New
2. Выбрать **Docker Compose**
3. Загрузить содержимое `docker-compose.yml` из репозитория
4. Установить Environment Variables (из `.env`)
5. Deploy

#### Вариант B: Git Integration (рекомендуется)

1. Подключить GitHub/GitLab репозиторий в Dokploy
2. Dokploy автоматически обнаружит `docker-compose.yml` в корне
3. Установить переменные окружения через UI
4. Деплой при каждом push в main

### Переменные окружения для Dokploy

Установить через UI Dokploy в Project Settings → Environment:


| Переменная       | Пример                                             | Описание                  |
| ---------------- | -------------------------------------------------- | ------------------------- |
| `NODE_ENV`       | `production`                                       | Node environment          |
| `DATABASE_URL`   | `postgresql://postgres:PASSWORD@postgres:5432/dmr` | Будет подставлена Dokploy |
| `DB_PASSWORD`    | `strong-random-password`                           | **ВАЖНО:** Измените!      |
| `JWT_SECRET`     | `min-32-chars-random-string`                       | **ВАЖНО:** Измените!      |
| `API_PORT`       | `3000`                                             | Порт API (внутренний)     |
| `FRONTEND_URL`   | `https://your-domain.com`                          | Публичный URL фронта      |
| `ADMIN_URL`      | `https://your-domain.com`                          | Публичный URL админки     |
| `GEMINI_API_KEY` | (опционально)                                      | Для переводов             |
| `GROQ_API_KEY`   | (опционально)                                      | Альтернатива Gemini       |


### Маршрутизация в Dokploy

1. **API-сервис:**
  - Порт контейнера: `3000`
  - Внешний доступ: `/api/`* или отдельный домен (например `api.your-domain.com`)
2. **Web-сервис:**
  - Порт контейнера: `80`
  - Внешний доступ: корневой домен (например `your-domain.com`)

Настройте reverse proxy / load balancer в Dokploy:

- Web → `your-domain.com`
- API → `your-domain.com:3000` или `api.your-domain.com`

### Хранение файлов (Uploads)

Docker-compose использует volume `./uploads:/app/uploads` для сохранения загруженных файлов.

**Для Dokploy:**

- Используется Docker volume, который сохраняется между деплоями
- Для долгосрочного хранения файлов переместите на S3/облако через конфиг API

### HTTPS / SSL в Dokploy

1. Если используете встроенный Nginx в Dokploy:
  - Включить Automatic SSL (Let's Encrypt)
2. Если свой обратный прокси:
  - Настроить SSL-сертификаты на уровне reverse proxy

### Резервная копия БД

Докплой обычно не включает автоматическое резервное копирование. Настройте вручную:

```bash
# На сервере Dokploy выполнить периодически:
docker-compose -f <compose-path> exec -T postgres \
  pg_dump -U postgres dmr > backup_$(date +%Y%m%d).sql
```

Или используйте Supabase для автоматических резервных копий (замена локального PostgreSQL).

## Troubleshooting

### API не запускается: "permission denied"

```bash
docker-compose down -v
docker-compose up -d --build
```

### PostgreSQL не инициализируется

```bash
docker-compose logs postgres
docker-compose down -v
docker-compose up -d postgres
# Дождаться инициализации
docker-compose up -d
```

### Web не видит API

Проверить `VITE_API_URL` в `.env` и переиспользовать контейнер:

```bash
docker-compose up -d --build web
```

### Миграции не выполняются

```bash
docker-compose exec api npx prisma migrate deploy
```

### Очистить всё и начать заново

```bash
docker-compose down -v
rm -rf uploads
docker-compose up -d
docker-compose exec api npm run prisma:seed
```

## Дополнительные ресурсы

- **Docker Compose docs:** [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- **Dokploy docs:** [https://dokploy.com/docs](https://dokploy.com/docs)
- **Prisma migrations:** [https://www.prisma.io/docs/concepts/components/prisma-migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

