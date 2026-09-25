import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubRegistryUtil } from '../GitHubRegistryUtil';
import { handleMap, typeMap } from '../utils';
import * as DataCache from '../DataCache';

// Avoid pulling the Stencil custom-element runtime (json-viewer uses @Prop)
// into the node unit environment.
vi.mock('../../components/json-viewer/json-viewer', () => ({}));

const validPid = '21.T11148/abc-123';
const typeRegistryUrl = 'https://api.github.com/repos/ThomasJejkal/simple-type-registry/git/trees/main?recursive=1';

const treeData = {
  tree: [
    { path: 'types/one.json', type: 'blob' },
    { path: 'types/nested/two.json', type: 'blob' },
    { path: 'types/three/thing.json', type: 'blob' },
  ],
};

const exclusionTree = {
  tree: [
    { path: 'types/one.json', type: 'blob' },
    { path: 'types/nested/schemas/skip.json', type: 'blob' },
    { path: 'types/README.md', type: 'blob' },
    { path: 'types/dir', type: 'tree' },
    { path: 'other/not-type.json', type: 'blob' },
  ],
};

describe('GitHubRegistryUtil', () => {
  let cachedFetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    cachedFetchSpy = vi.spyOn(DataCache, 'cachedFetch');
    GitHubRegistryUtil.reset();
  });

  afterEach(() => {
    cachedFetchSpy.mockRestore();
    GitHubRegistryUtil.reset();
    handleMap.clear();
    typeMap.clear();
  });

  it('populates type map and handle map from valid JSON files', async () => {
    cachedFetchSpy.mockImplementation((url: string) => {
      if (url === typeRegistryUrl) {
        return Promise.resolve(treeData);
      }
      if (url.includes('nested/two.json')) {
        return Promise.resolve({ pid: '21.T11148/pid-two', name: 'Type two', description: '' });
      }
      if (url.includes('three/thing.json')) {
        return Promise.resolve({ pid: '21.T11148/pid-thing', name: 'Type thing', description: '' });
      }
      return Promise.resolve({ pid: validPid, name: 'Type one', description: 'Description for one' });
    });

    await GitHubRegistryUtil.initializeFromGitHub();

    expect(cachedFetchSpy).toHaveBeenCalledWith(typeRegistryUrl);
    expect(typeMap.size).toBe(3);
    expect(handleMap.size).toBe(3);
    expect(typeMap.get(validPid)?.name).toBe('Type one');
  });

  it('skips files under schemas/, non-json, non-blob and non-types/ entries', async () => {
    cachedFetchSpy.mockImplementation((url: string) => {
      if (url === typeRegistryUrl) {
        return Promise.resolve(exclusionTree);
      }
      return Promise.resolve({ pid: validPid, name: 'only file', description: '' });
    });

    await GitHubRegistryUtil.initializeFromGitHub();

    // Only the single valid "types/one.json" blob is processed.
    expect(typeMap.size).toBe(1);
    expect(handleMap.size).toBe(1);
  });

  it('ignores files without a pid', async () => {
    cachedFetchSpy.mockImplementation((url: string) => {
      if (url === typeRegistryUrl) {
        return Promise.resolve(treeData);
      }
      return Promise.resolve({ pid: '', name: 'No pid file', description: '' });
    });

    await GitHubRegistryUtil.initializeFromGitHub();

    expect(typeMap.size).toBe(0);
    expect(handleMap.size).toBe(0);
  });

  it('does not populate maps when the tree is missing', async () => {
    cachedFetchSpy.mockResolvedValue({ other: true });

    await GitHubRegistryUtil.initializeFromGitHub();

    expect(typeMap.size).toBe(0);
    expect(handleMap.size).toBe(0);
  });

  it('continues when a single JSON file fails to process', async () => {
    cachedFetchSpy.mockImplementationOnce(() => Promise.resolve(treeData));
    cachedFetchSpy.mockImplementation((url: string) => {
      if (url.indexOf('one') !== -1) {
        return Promise.reject(new Error('boom'));
      }
      return Promise.resolve({ pid: validPid, name: 'ok', description: '' });
    });

    await GitHubRegistryUtil.initializeFromGitHub();

    // first file fails, but remaining ones still populate the maps
    expect(typeMap.size).toBeGreaterThan(0);
  });

  it('caches the initialization promise to avoid re-fetching', async () => {
    cachedFetchSpy.mockImplementation((url: string) => {
      if (url === typeRegistryUrl) {
        return Promise.resolve(treeData);
      }
      return Promise.resolve({ pid: validPid, name: 'x', description: '' });
    });

    await GitHubRegistryUtil.initializeFromGitHub();
    await GitHubRegistryUtil.initializeFromGitHub();

    // tree fetched only once because initPromise is memoized
    expect(cachedFetchSpy.mock.calls.filter((c: unknown[]) => c[0] === typeRegistryUrl)).toHaveLength(1);
  });
});
