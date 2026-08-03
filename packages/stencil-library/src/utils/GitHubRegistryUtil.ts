import { PID } from '../rendererModules/Handle/PID';
import { PIDDataType } from '../rendererModules/Handle/PIDDataType';
import { typeMap } from './utils';
import { cachedFetch } from './DataCache';

interface GitHubApiEntry {
  name: string;
  path: string;
  type: string;
  download_url?: string;
}

interface SimpleTypeRegistryEntry {
  pid: string;
  name: string;
  description: string;
}

export class GitHubRegistryUtil {
  private static readonly GITHUB_API_BASE = 'https://api.github.com/repos/ThomasJejkal/simple-type-registry/contents/types?recursive=1';
  private static initialized = false;

  /**
   * Initializes the simple type registry by fetching all JSON files from the GitHub repository.
   * Skips files located in 'schemas' subdirectory.
   */
  public static async initializeFromGitHub(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const entries = await cachedFetch(this.GITHUB_API_BASE) as GitHubApiEntry[];

      if (!Array.isArray(entries)) {
        console.warn('GitHub API did not return an array of entries');
        return;
      }

      for (const entry of entries) {
        // Skip files in 'schemas' directory
        if (entry.path.includes('schemas')) {
          continue;
        }

        // Only process JSON files
        if (entry.type === 'file' && entry.name.endsWith('.json') && entry.download_url) {
          try {
            const fileData = await cachedFetch(entry.download_url) as SimpleTypeRegistryEntry;

            if (fileData.pid) {
              const pid = PID.getPIDFromString(fileData.pid);
              const dataType = new PIDDataType(
                pid,
                fileData.name || '',
                fileData.description || '',
                entry.download_url,
                undefined
              );

              typeMap.set(pid, dataType);
            }
          } catch (error) {
            console.warn(`Failed to process file ${entry.name}:`, error);
          }
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize type registry from GitHub:', error);
    }
  }

  /**
   * Resets the initialization state (useful for testing).
   */
  public static reset(): void {
    this.initialized = false;
  }
}
