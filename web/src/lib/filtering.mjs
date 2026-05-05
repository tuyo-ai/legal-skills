export function normalizeSearchValue(value) {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeType(value) {
  const normalized = normalizeSearchValue(value);
  if (!normalized || normalized === 'all') return 'all';
  if (normalized === 'skills' || normalized === 'skill') return 'skill';
  if (normalized === 'agents' || normalized === 'agent') return 'agent';
  if (normalized === 'mcps' || normalized === 'mcp' || normalized === 'mcp server') return 'mcp';
  return normalized;
}

export function searchableTextForEntry(entry) {
  return [
    entry.searchText,
    entry.title,
    entry.description,
    entry.collection,
    entry.collectionLabel,
    entry.type,
    entry.country,
    entry.language,
    ...(entry.capabilities || []),
  ]
    .filter(Boolean)
    .join(' ');
}

export function matchesRegistryFilters(entry, filters = {}) {
  const query = normalizeSearchValue(filters.query);
  const type = normalizeType(filters.type || 'all');
  const country = normalizeSearchValue(filters.country || 'all');
  const entryType = normalizeType(entry.collection || entry.collectionLabel || entry.type);
  const entryCountry = normalizeSearchValue(entry.country || '');
  const haystack = normalizeSearchValue(searchableTextForEntry(entry));
  const tokens = query.split(/\s+/).filter(Boolean);

  const queryMatches = tokens.length === 0 || tokens.every((token) => haystack.includes(token));
  const typeMatches = type === 'all' || entryType === type;
  const countryMatches = country === 'all' || entryCountry === country;

  return queryMatches && typeMatches && countryMatches;
}
