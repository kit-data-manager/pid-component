/**
 * This class represents a DOI (Digital Object Identifier).
 * DOIs are a subset of Handle PIDs that start with the prefix "10."
 */
export class DOI {
  /**
   * The full DOI string.
   * @type {string}
   * @private
   */
  private readonly _doi: string;

  /**
   * Creates a new DOI object.
   * @param doi The DOI string (with or without https://doi.org/ prefix).
   * @constructor
   */
  constructor(doi: string) {
    // Remove common DOI URL prefixes if present
    this._doi = doi
      .replace(/^https?:\/\/doi\.org\//i, '')
      .replace(/^https?:\/\/dx\.doi\.org\//i, '')
      .replace(/^doi:/i, '');
  }

  /**
   * Returns the DOI string.
   * @returns {string} The DOI string.
   */
  get doi(): string {
    return this._doi;
  }

  /**
   * Checks if a string has the format of a DOI.
   * DOIs start with "10." followed by a registrant code and a suffix.
   * @param text The string to check.
   * @returns {boolean} True if the string could be a DOI, false if not.
   */
  public static isDOI(text: string): boolean {
    // Remove common prefixes for validation
    const cleaned = text
      .replace(/^https?:\/\/doi\.org\//i, '')
      .replace(/^https?:\/\/dx\.doi\.org\//i, '')
      .replace(/^doi:/i, '');
    
    // DOI regex: starts with "10.", followed by registrant code, slash, and suffix
    // The suffix can contain various characters
    return /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/.test(cleaned);
  }

  /**
   * Creates a DOI from a string.
   * @param doi The string to create the DOI from.
   * @throws Error if the string is not a DOI.
   * @returns {DOI} The DOI which was created.
   */
  public static getDOIFromString(doi: string): DOI {
    if (!DOI.isDOI(doi)) throw new Error('Invalid DOI format');
    return new DOI(doi);
  }

  /**
   * Returns the DOI as a resolvable URL.
   * @returns {string} The DOI URL.
   */
  toURL(): string {
    return `https://doi.org/${this._doi}`;
  }

  /**
   * Returns the DOI as a string.
   * @returns {string} The DOI string.
   */
  toString(): string {
    return this._doi;
  }

  /**
   * Creates a DOI from JSON.
   * @param serialized The serialized DOI.
   * @returns {DOI} The DOI object.
   */
  static fromJSON(serialized: string): DOI {
    const data: ReturnType<DOI['toObject']> = JSON.parse(serialized);
    return new DOI(data.doi);
  }

  /**
   * Converts the DOI to an object.
   * @returns {object} The DOI as an object.
   */
  toObject() {
    return {
      doi: this._doi,
    };
  }
}
