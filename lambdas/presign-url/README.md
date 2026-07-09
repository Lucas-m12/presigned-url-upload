# presign-url

Mints an S3 presigned **PUT** URL so the frontend can upload a file directly to S3.

> **Note:** `index.mjs` is a reference implementation that matches the contract the frontend
> already expects. Replace it with your actual deployed handler if it differs (this repo previously
> had no copy of the deployed code).

## Contract

- **Request:** `POST` with JSON body `{ "filename": "<name>" }`
- **Response:** `200` with JSON body `{ "signedUrl": "<url>" }`
- CORS is enabled for `POST`/`OPTIONS` so the browser can call it from the web app.

The presign does **not** bind a `Content-Type`, because the frontend sends the file's own
`Content-Type` header on the upload PUT (`apps/web/src/services/uploader/presignedUploader.ts`).

## Runtime

- **Node.js 20+** (ESM). Handler entrypoint: `index.handler`.

## Environment variables

| Variable         | Required | Default | Description                                        |
| ---------------- | -------- | ------- | -------------------------------------------------- |
| `BUCKET_NAME`    | yes      | —       | Target S3 bucket.                                  |
| `AWS_REGION`     | —        | (Lambda-provided) | Region of the bucket.                    |
| `KEY_PREFIX`     | no       | `''`    | Prefix prepended to the object key.                |
| `EXPIRES_IN`     | no       | `300`   | Presigned URL lifetime, in seconds.                |
| `ALLOWED_ORIGIN` | no       | `*`     | Value for `Access-Control-Allow-Origin`.           |

The function's execution role needs `s3:PutObject` on `arn:aws:s3:::<BUCKET_NAME>/*`.

## Package & deploy (manual, via AWS console)

From the repo root:

```bash
cd lambdas/presign-url && npm install --omit=dev && cd -
pnpm package:lambda presign-url
```

This produces `dist/lambdas/presign-url.zip`. Upload it in the AWS console
(Lambda → your function → Code → Upload from → .zip file), and set the handler to `index.handler`.
