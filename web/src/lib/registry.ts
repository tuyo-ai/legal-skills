import fs from 'node:fs';
import path from 'node:path';

export type RegistryCollection = 'skills' | 'agents' | 'mcps';

export interface RegistryEntry {
  collection: RegistryCollection;
  collectionLabel: string;
  title: string;
  type: string;
  country: string;
  language: string;
  slug: string;
  description: string;
  capabilities: string[];
  raw: string;
  relativePath: string;
  href: string;
  githubUrl: string;
}

const DATA_DIR = path.resolve(process.cwd(), '..', 'data');
const GITHUB_BASE = 'https://github.com/tuyo-ai/legal-skills/blob/main';

const COLLECTION_LABELS: Record<RegistryCollection, string> = {
  skills: 'Skill',
  agents: 'Agent',
  mcps: 'MCP',
};

function walkMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdownFiles(absolutePath);
      if (/\.mdx?$/i.test(entry.name)) return [absolutePath];
      return [];
    });
}

function readField(markdown: string, fieldName: string): string | undefined {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*(.+)$`, 'im'));
  return match?.[1]?.trim();
}

function readTitle(markdown: string, slug: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? slugToTitle(slug);
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function readCapabilities(markdown: string): string[] {
  const match = markdown.match(/^##\s+Capabilities\s*\n([\s\S]*?)(?=\n##\s+|$)/im);
  if (!match) return [];

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^-\s+/, '').trim())
    .filter(Boolean);
}

function parseEntry(filePath: string): RegistryEntry | null {
  const relativePath = path.relative(DATA_DIR, filePath).split(path.sep).join('/');
  const [collectionRaw, languageFromPath = 'en', countryFromPath = 'global'] = relativePath.split('/');

  if (!['skills', 'agents', 'mcps'].includes(collectionRaw)) return null;

  const collection = collectionRaw as RegistryCollection;
  const raw = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(filePath).replace(/\.mdx?$/i, '');
  const title = readTitle(raw, slug);
  const country = readField(raw, 'Country') ?? countryFromPath.toUpperCase();
  const language = readField(raw, 'Language') ?? languageFromPath;
  const description = readField(raw, 'Description') ?? 'Community-submitted legal AI resource.';

  return {
    collection,
    collectionLabel: COLLECTION_LABELS[collection],
    title,
    type: readField(raw, 'Type') ?? COLLECTION_LABELS[collection],
    country,
    language,
    slug,
    description,
    capabilities: readCapabilities(raw),
    raw,
    relativePath,
    href: `/${collection}/${slug}/`,
    githubUrl: `${GITHUB_BASE}/data/${relativePath}`,
  };
}

export function getRegistryEntries(): RegistryEntry[] {
  return walkMarkdownFiles(DATA_DIR)
    .map(parseEntry)
    .filter((entry): entry is RegistryEntry => Boolean(entry))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInline(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+):\*\*/g, '<strong>$1:</strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.trim().split(/\r?\n/);
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
      index += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      html.push(`<h2>${formatInline(line.slice(3))}</h2>`);
      index += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      html.push(`<h1>${formatInline(line.slice(2))}</h1>`);
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(`<li>${formatInline(lines[index].trim().slice(2))}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(`<li>${formatInline(lines[index].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !lines[index].trim().startsWith('- ') &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${formatInline(paragraphLines.join(' '))}</p>`);
  }

  return html.join('\n');
}
