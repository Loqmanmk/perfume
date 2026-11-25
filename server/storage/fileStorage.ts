import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

export const UPLOADS_PREFIX = '/uploads';

/**
 * Where uploaded files live. Routes depend on this interface only, so moving
 * to S3, R2 or Cloudinary later means writing one new class.
 */
export interface FileStorage {
  /** Saves the bytes and returns the public URL. */
  save(bytes: Uint8Array, extension: string): Promise<string>;
  /** Removes a file previously returned by `save`. Unknown URLs are ignored. */
  delete(url: string): Promise<void>;
}

const newFileName = (extension: string) => `${randomUUID()}.${extension}`;

/** Only names we generated are accepted — never a path from the client. */
const fileNameFromUrl = (url: string) =>
  url.startsWith(`${UPLOADS_PREFIX}/`) ? basename(url) : undefined;

export class LocalDiskStorage implements FileStorage {
  private readonly directory: string;

  constructor(directory: string) {
    this.directory = directory;
  }

  async save(bytes: Uint8Array, extension: string): Promise<string> {
    await mkdir(this.directory, { recursive: true });
    const name = newFileName(extension);
    await writeFile(join(this.directory, name), bytes);
    return `${UPLOADS_PREFIX}/${name}`;
  }

  async delete(url: string): Promise<void> {
    const name = fileNameFromUrl(url);
    if (name) await rm(join(this.directory, name), { force: true });
  }
}

/** Keeps files in memory. For tests. */
export class MemoryStorage implements FileStorage {
  readonly files = new Map<string, Uint8Array>();

  async save(bytes: Uint8Array, extension: string): Promise<string> {
    const url = `${UPLOADS_PREFIX}/${newFileName(extension)}`;
    this.files.set(url, bytes);
    return url;
  }

  async delete(url: string): Promise<void> {
    this.files.delete(url);
  }
}
