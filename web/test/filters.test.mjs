import assert from 'node:assert/strict';
import test from 'node:test';

import { matchesRegistryFilters, normalizeSearchValue } from '../src/lib/filtering.mjs';
import { COUNTRIES, SANCTIONED_COUNTRY_NAMES } from '../src/lib/countries.mjs';

const entries = [
  {
    title: 'Contract Analyzer',
    description: 'Analyzes commercial contracts.',
    collection: 'skills',
    collectionLabel: 'Skill',
    type: 'Skill',
    country: 'US',
    language: 'en',
    capabilities: ['Clause detection'],
  },
  {
    title: 'Clara',
    description: 'Spanish civil law intake.',
    collection: 'agents',
    collectionLabel: 'Agent',
    type: 'Agent',
    country: 'ES',
    language: 'es',
    capabilities: [],
  },
  {
    title: 'Legal Search MCP',
    description: 'Provides access to UK legislation.',
    collection: 'mcps',
    collectionLabel: 'MCP',
    type: 'MCP Server',
    country: 'UK',
    language: 'en',
    capabilities: ['Search UK Statutes'],
  },
];

test('normalizes accents and casing for free-text search', () => {
  assert.equal(normalizeSearchValue('  España CONTRATOS  '), 'espana contratos');
});

test('matches by query tokens plus selected type and country', () => {
  assert.equal(matchesRegistryFilters(entries[0], { query: 'contract us', type: 'skill', country: 'US' }), true);
  assert.equal(matchesRegistryFilters(entries[0], { query: 'contract us', type: 'agent', country: 'US' }), false);
  assert.equal(matchesRegistryFilters(entries[2], { query: 'mcp uk statutes', type: 'mcp', country: 'UK' }), true);
  assert.equal(matchesRegistryFilters(entries[1], { query: 'civil intake', type: 'agent', country: 'ES' }), true);
});

test('all filter values behave as non-restrictive defaults', () => {
  assert.equal(matchesRegistryFilters(entries[0], { query: '', type: 'all', country: 'all' }), true);
  assert.equal(matchesRegistryFilters(entries[2], { query: 'legal', type: 'all', country: 'all' }), true);
});

test('country selector source includes normal jurisdictions and excludes sanctioned jurisdictions', () => {
  const countryNames = COUNTRIES.map((country) => country.name);
  const countryCodes = COUNTRIES.map((country) => country.code);

  assert.ok(countryCodes.includes('ES'));
  assert.ok(countryCodes.includes('US'));
  assert.ok(countryCodes.includes('UK'));
  assert.ok(countryNames.includes('Spain'));
  assert.ok(countryNames.includes('United States'));
  assert.ok(countryNames.includes('United Kingdom'));

  for (const sanctionedName of SANCTIONED_COUNTRY_NAMES) {
    assert.equal(countryNames.includes(sanctionedName), false, `${sanctionedName} must not be selectable`);
  }
});
