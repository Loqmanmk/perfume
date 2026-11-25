export type UploadKind = 'image' | 'model';

interface FileRule {
  extensions: readonly string[];
  maxBytes: number;
  label: string;
}

const MB = 1024 * 1024;

export const UPLOAD_RULES: Record<UploadKind, FileRule> = {
  image: { extensions: ['jpg', 'png', 'webp'], maxBytes: 10 * MB, label: 'a JPEG, PNG or WebP photo' },
  model: { extensions: ['glb'], maxBytes: 40 * MB, label: 'a .glb 3D model' },
};

const startsWith = (bytes: Uint8Array, signature: readonly number[], offset = 0) =>
  signature.every((byte, index) => bytes[offset + index] === byte);

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

/**
 * Identifies a file from its first bytes. The browser-supplied name and MIME
 * type are never trusted: a script renamed to `photo.jpg` is rejected here.
 */
export function detectExtension(bytes: Uint8Array): string | undefined {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return 'webp';
  if (startsWith(bytes, ascii('glTF'))) return 'glb';
  return undefined;
}
