# presigned-url-upload

A file-upload web app plus its AWS Lambda backend, in one pnpm monorepo.

The web app uploads files directly to S3 using **presigned URLs**: it asks the `presign-url` Lambda
for a URL, then PUTs the file straight to S3.

## Layout

```
.
├── apps/
│   └── web/            # React 19 + TypeScript + Vite frontend
├── lambdas/
│   └── presign-url/    # Lambda that mints presigned S3 URLs (one folder per function)
└── scripts/
    └── package-lambda.sh   # zips a lambda folder for manual console upload
```

- `apps/*` (and `packages/*`) are pnpm workspace members. `lambdas/*` are **not** — each Lambda is a
  self-contained folder so its `.zip` is upload-complete. See `lambdas/README.md`.

## Frontend

```bash
pnpm install          # install workspace deps (run once, at the repo root)
pnpm dev              # start the Vite dev server
pnpm build            # type-check + build to apps/web/dist
pnpm lint             # oxlint
pnpm preview          # preview the production build
```

Configure the backend endpoint via `apps/web/.env` (copy from `apps/web/.env.example`):

```
VITE_PRESIGN_URL=https://<your-lambda-url>/
```

`.env` is gitignored; `VITE_PRESIGN_URL` is required — uploads throw a clear error if it's unset.

## Lambdas

Deployment is manual (upload a `.zip` in the AWS console). To package one:

```bash
# Node example: vendor prod deps first, then zip
cd lambdas/presign-url && npm install --omit=dev && cd -
pnpm package:lambda presign-url     # -> dist/lambdas/presign-url.zip
```

See `lambdas/README.md` for the folder convention and how to add a new function, and each function's
own `README.md` for its runtime, handler, and environment variables.
