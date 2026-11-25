import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import { requireRole, type AppEnv } from '../http/context.ts';
import type { FileStorage } from '../storage/fileStorage.ts';
import { detectExtension, UPLOAD_RULES, type UploadKind } from '../storage/fileType.ts';

const isUploadKind = (value: unknown): value is UploadKind =>
  typeof value === 'string' && value in UPLOAD_RULES;

const LARGEST_UPLOAD = Math.max(...Object.values(UPLOAD_RULES).map((rule) => rule.maxBytes));

export function uploadRoutes({ storage }: { storage: FileStorage }) {
  return new Hono<AppEnv>().post(
    '/',
    requireRole('admin'),
    bodyLimit({
      maxSize: LARGEST_UPLOAD + 1024 * 1024,
      onError: () => {
        throw new HTTPException(413, { message: 'This file is too large.' });
      },
    }),
    async (c) => {
      const body = await c.req.parseBody();
      const { file, kind } = body;

      if (!isUploadKind(kind)) throw new HTTPException(400, { message: 'Unknown upload type.' });
      if (!(file instanceof File)) throw new HTTPException(400, { message: 'Choose a file to upload.' });

      const rule = UPLOAD_RULES[kind];
      if (file.size > rule.maxBytes) {
        throw new HTTPException(413, {
          message: `This file is too large. The limit is ${rule.maxBytes / 1024 / 1024} MB.`,
        });
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const extension = detectExtension(bytes);
      if (!extension || !rule.extensions.includes(extension)) {
        throw new HTTPException(415, { message: `Please upload ${rule.label}.` });
      }

      return c.json({ url: await storage.save(bytes, extension) }, 201);
    },
  );
}
