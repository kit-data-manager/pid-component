import { PID } from '../rendererModules/Handle/PID';
import { PIDDataType } from '../rendererModules/Handle/PIDDataType';
import { handleMap, typeMap } from './utils';
import { cachedFetch } from './DataCache';
import { PIDRecord } from '../rendererModules/Handle/PIDRecord';

interface SimpleTypeRegistryEntry {
  pid: string;
  name: string;
  description: string;
}

interface TreeEntry {
  path: string;
  type: string;
}

export class GitHubRegistryUtil {
  private static readonly GITHUB_TREE_API = 'https://api.github.com/repos/ThomasJejkal/simple-type-registry/git/trees/main?recursive=1';
  private static readonly GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types';
  private static initPromise: Promise<void> | null = null;

  private static async doInitialize(): Promise<void> {
    try {
      const treeData = await cachedFetch(this.GITHUB_TREE_API) as { tree: TreeEntry[] };

      if (!treeData.tree || !Array.isArray(treeData.tree)) {
        console.warn('GitHub API did not return a valid tree');
        return;
      }

      const jsonFiles = treeData.tree.filter((entry: TreeEntry) => {
        if (entry.type !== 'blob') {
          return false;
        }
        if (!entry.path.endsWith('.json')) {
          return false;
        }
        if (!entry.path.startsWith('types/')) {
          return false;
        }
        return !entry.path.includes('/schemas/');
      });

      for (const file of jsonFiles) {
        try {
          const url = `${this.GITHUB_RAW_BASE}/${file.path.replace('types/', '')}`;
          const fileData = await cachedFetch(url) as SimpleTypeRegistryEntry;

          if (fileData.pid) {
            const pid = PID.getPIDFromString(fileData.pid);
            const dataType = new PIDDataType(
              pid,
              fileData.name,
              fileData.description || '',
              url,
              undefined
            );

            typeMap.set(pid.toString(), dataType);
            const timestamp = Date.now();
            const handleData = [{
              index: 1,
              type: dataType,
              data: { format: 'string', value: '' },
              ttl: 86400,
              timestamp
            }];
            const pidRecord = new PIDRecord(pid, handleData);

            handleMap.set(pid.toString(), pidRecord);
          }
        } catch (error) {
          console.warn(`Failed to process file ${file.path}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize type registry from GitHub:', error);
    }
  }

  /**
   * Initializes the simple type registry by fetching all JSON files from the GitHub repository.
   * Skips files located in 'schemas' subdirectory.
   * Returns a promise that resolves when initialization is complete.
   */
  public static initializeFromGitHub(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.doInitialize();
    }
    return this.initPromise;
  }

  /**
   * Resets the initialization state (useful for testing).
   */
  public static reset(): void {
    this.initPromise = null;
  }
}
