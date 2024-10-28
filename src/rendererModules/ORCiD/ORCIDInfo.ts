import { cachedFetch } from '../../utils/DataCache';

/**
 * This file contains the ORCIDInfo class, which is used to store information about an ORCiD.
 */
export class ORCIDInfo {
  /**
   * The ORCiD of the person.
   * @private
   * @type {string}
   */
  private readonly _orcid: string;

  /**
   * The family name of the person.
   * @private
   * @type {string}
   */
  private readonly _familyName: string;

  /**
   * The given names of the person.
   * @private
   * @type {string[]}
   */
  private readonly _givenNames: string[];

  /**
   * A list of employments of the person.
   * It is a list of objects, each containing the start date, end date, organization and department of the employment.
   * (optional)
   * @private
   * @type {{startDate: Date, endDate: Date | null, organization: string, department: string}[]}
   */
  private readonly _employments?: Employment[];

  /**
   * The preferred locale of the person.
   * (optional)
   * @private
   * @type {string}
   */
  private readonly _preferredLocale?: string;

  /**
   * The biography of the person.
   * (optional)
   * @private
   * @type {string}
   */
  private readonly _biography?: string;

  /**
   * The list of email addresses of the person.
   * (optional)
   * @private
   * @type {{email: string, primary: boolean, verified: boolean}[]}
   */
  private readonly _emails?: {
    /**
     * The email address itself.
     * @type {string}
     */
    email: string;
    /**
     * Whether the email address is the primary email address of the person.
     * @type {boolean}
     */
    primary: boolean;
    /**
     * Whether the email address is verified.
     * @type {boolean}
     */
    verified: boolean;
  }[];

  /**
   * The list of keywords of the person.
   * (optional)
   * @private
   * @type {{content: string, index: number}[]}
   */
  private readonly _keywords?: {
    /**
     * The keyword itself.
     * @type {string}
     */
    content: string;
    /**
     * The index of the keyword.
     * @type {number}
     */
    index: number;
  }[];

  /**
   * A list of customized URLs provided by the person.
   * (optional)
   * @type {{url: string, name: string, index: number}[]}
   * @private
   */
  private readonly _researcherUrls?: {
    /**
     * The URL itself.
     * @type {string}
     */
    url: string;
    /**
     * The name of the URL.
     * @type {string}
     */
    name: string;
    /**
     * The index of the URL.
     * @type {number}
     */
    index: number;
  }[];

  /**
   * The country where the person is located.
   * (optional)
   * @type {string}
   * @private
   */
  private readonly _country?: string;

  /**
   * The raw JSON data received from the ORCiD API.
   * @type {object}
   * @private
   */
  private readonly _ORCiDJSON: object;

  /**
   * Creates a new ORCIDInfo object.
   * @param orcid The ORCiD of the person.
   * @param ORCiDJSON The raw JSON data received from the ORCiD API.
   * @param familyName The family name of the person.
   * @param givenNames The given names of the person.
   * @param employments The list of employments of the person.
   * @param preferredLocale The preferred locale of the person.
   * @param biography The biography of the person.
   * @param emails The list of email addresses of the person.
   * @param keywords The list of keywords of the person.
   * @param researcherUrls The list of customized URLs provided by the person.
   * @param country The country where the person is located.
   * @constructor
   */
  constructor(
    orcid: string,
    ORCiDJSON: object,
    familyName: string,
    givenNames: string[],
    employments?: Employment[],
    preferredLocale?: string,
    biography?: string,
    emails?: {
      email: string;
      primary: boolean;
      verified: boolean;
    }[],
    keywords?: { content: string; index: number }[],
    researcherUrls?: {
      url: string;
      name: string;
      index: number;
    }[],
    country?: string,
  ) {
    this._orcid = orcid;
    this._familyName = familyName;
    this._givenNames = givenNames;
    this._employments = employments;
    this._preferredLocale = preferredLocale;
    this._biography = biography;
    this._emails = emails;
    this._keywords = keywords;
    this._researcherUrls = researcherUrls;
    this._country = country;
    this._ORCiDJSON = ORCiDJSON;
  }

  /**
   * Outputs the ORCiD of the person.
   * @returns {string} The ORCiD of the person.
   */
  get orcid(): string {
    return this._orcid;
  }

  /**
   * Outputs the family name of the person.
   * @returns {string} The family name of the person.
   */
  get familyName(): string {
    return this._familyName;
  }

  /**
   * Outputs the given names of the person.
   * @returns {string[]} The given names of the person.
   */
  get givenNames(): string[] {
    return this._givenNames;
  }

  /**
   * Outputs the raw JSON data received from the ORCiD API.
   * @returns {object} The raw JSON data received from the ORCiD API.
   */
  get ORCiDJSON(): object {
    return this._ORCiDJSON;
  }

  /**
   * Outputs the list of employments of the person.
   * It is a list of objects, each containing the start date, end date, organization and department of the employment.
   * @returns {{startDate: Date, endDate: Date | null, organization: string, department: string}[]} The list of employments of the person.
   */
  get employments(): Employment[] {
    return this._employments;
  }

  /**
   * Outputs the preferred locale of the person.
   * @returns {string} The preferred locale of the person.
   */
  get preferredLocale(): string {
    return this._preferredLocale;
  }

  /**
   * Outputs the biography of the person.
   * @returns {string} The biography of the person.
   */
  get biography(): string {
    return this._biography;
  }

  /**
   * Outputs the list of email addresses of the person.
   * @returns {{email: string, primary: boolean, verified: boolean}[]} The list of email addresses of the person.
   */
  get emails(): { email: string; primary: boolean; verified: boolean }[] {
    return this._emails;
  }

  /**
   * Outputs the list of keywords of the person.
   * @returns {{content: string, index: number}[]} The list of keywords of the person.
   */
  get keywords(): { content: string; index: number }[] {
    return this._keywords;
  }

  /**
   * Outputs the list of customized URLs provided by the person.
   * @returns {{url: string, name: string, index: number}[]} The list of customized URLs provided by the person.
   */
  get researcherUrls(): { url: string; name: string; index: number }[] {
    return this._researcherUrls;
  }

  /**
   * Outputs the country where the person is located.
   * @returns {string} The country where the person is located.
   */
  get country(): string {
    return this._country;
  }

  /**
   * Checks if a string has the format of an ORCiD.
   * @param text The string to check.
   * @returns {boolean} True if the string could be an ORCiD, false if not.
   */
  static isORCiD(text: string): boolean {
    const regex = new RegExp('^(https://orcid.org/)?[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$');
    return regex.test(text);
  }

  /**
   * Fetches the ORCiD data for a given ORCiD and returns it as an ORCIDInfo object.
   * @param orcid The ORCiD to fetch the data for.
   * @returns {Promise<ORCIDInfo>} The ORCIDInfo object containing the data.
   */
  static async getORCiDInfo(orcid: string): Promise<ORCIDInfo> {
    if (!ORCIDInfo.isORCiD(orcid)) throw new Error('Invalid input');

    if (orcid.match('^(https://orcid.org/)?[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$') !== null) orcid = orcid.replace('https://orcid.org/', '');
    const rawOrcidJSON = await cachedFetch(`https://pub.orcid.org/v3.0/${orcid}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    // .then(response => response.json());

    // Parse family name and given names
    const familyName = rawOrcidJSON['person']['name']['family-name']['value'];
    const givenNames = rawOrcidJSON['person']['name']['given-names']['value'];

    // Parse employments, if available
    const affiliations = rawOrcidJSON['activities-summary']['employments']['affiliation-group'];
    const employments: Employment[] = [];
    try {
      for (let i = 0; i < affiliations.length; i++) {
        const employmentSummary = affiliations[i]['summaries'][0]['employment-summary'];
        const employment = new Employment(new Date(), null, '', '');
        if (employmentSummary['start-date'] !== null)
          employment.startDate = new Date(
            employmentSummary['start-date']['year']['value'],
            employmentSummary['start-date']['month']['value'],
            employmentSummary['start-date']['day']['value'],
          );
        if (employmentSummary['end-date'] !== null)
          employment.endDate = new Date(
            employmentSummary['end-date']['year']['value'],
            employmentSummary['end-date']['month']['value'],
            employmentSummary['end-date']['day']['value'],
          );
        employment.organization = employmentSummary['organization']['name'];
        employment.department = employmentSummary['department-name'];

        employments.push(employment);
      }
    } catch (e) {
      console.debug(e);
    }

    // Parse preferred locale, if available
    const preferredLocale: string | undefined = rawOrcidJSON['preferences']['locale'] !== null ? rawOrcidJSON['preferences']['locale'] : undefined;

    // Parse biography, if available
    const biography: string | undefined = rawOrcidJSON['person']['biography'] !== null ? rawOrcidJSON['person']['biography']['content'] : undefined;

    // Parse e-mail addresses, if available
    const emails: { email: string; primary: boolean; verified: boolean }[] | undefined = [];
    if (rawOrcidJSON['person']['emails']['email'] !== null) {
      for (const email of rawOrcidJSON['person']['emails']['email']) {
        emails.push({
          email: email['email'],
          primary: email['primary'],
          verified: email['verified'],
        });
      }
    }

    // Parse keywords, if available, and sort them by index
    const keywords: { content: string; index: number }[] | undefined = [];
    if (rawOrcidJSON['person']['keywords']['keyword'] !== null) {
      for (const keyword of rawOrcidJSON['person']['keywords']['keyword']) {
        keywords.push({
          content: keyword['content'],
          index: keyword['display-index'],
        });
      }
      keywords.sort((a, b) => a.index - b.index);
    }

    // Parse researcher URLs, if available, and sort them by index
    const researcherUrls: { url: string; name: string; index: number }[] | undefined = [];
    if (rawOrcidJSON['person']['researcher-urls']['researcher-url'] !== null) {
      for (const researcherUrl of rawOrcidJSON['person']['researcher-urls']['researcher-url']) {
        researcherUrls.push({
          url: researcherUrl['url']['value'],
          name: researcherUrl['url-name'],
          index: researcherUrl['display-index'],
        });
      }
      researcherUrls.sort((a, b) => a.index - b.index);
    }

    // Parse country, if available
    const country: string | undefined =
      rawOrcidJSON['person']['addresses']['address'].length > 0 ? rawOrcidJSON['person']['addresses']['address'][0]['country']['value'] : undefined;

    // Return the ORCIDInfo object
    return new ORCIDInfo(orcid, rawOrcidJSON, familyName, givenNames, employments, preferredLocale, biography, emails, keywords, researcherUrls, country);
  }

  static fromJSON(serialized: string): ORCIDInfo {
    const data: ReturnType<ORCIDInfo['toObject']> = JSON.parse(serialized);
    const employments = data.employments.map(employment => Employment.fromJSON(employment));
    return new ORCIDInfo(
      data.orcid,
      data.ORCiDJSON,
      data.familyName,
      data.givenNames,
      employments,
      data.preferredLocale,
      data.biography,
      data.emails,
      data.keywords,
      data.researcherUrls,
      data.country,
    );
  }

  /**
   * Outputs the employment object of the person at a given date.
   * @param date The date to check.
   * @returns {{startDate: Date, endDate: Date | null, organization: string, department: string} | undefined} The employment object of the person at the given date.
   */
  getAffiliationsAt(date: Date): Employment[] {
    const affiliations: Employment[] = [];
    for (const employment of this._employments) {
      if (employment.startDate <= date && employment.endDate === null) affiliations.push(employment);
      if (employment.startDate <= date && employment.endDate !== null && employment.endDate >= date) affiliations.push(employment);
    }
    return affiliations;
  }

  /**
   * Outputs a string representation of an affiliation object.
   * @param affiliation The affiliation object to convert to a string.
   * @param showDepartment Whether to show the department in the string.
   * @returns {string | undefined} The string representation of the affiliation object.
   */
  getAffiliationAsString(affiliation: Employment, showDepartment: boolean = true): string | undefined {
    if (affiliation === undefined || affiliation.organization === null) return undefined;
    else {
      if (showDepartment && affiliation.department !== null) return `${affiliation.organization} [${affiliation.department}]`;
      else return affiliation.organization;
    }
  }

  toObject() {
    return {
      orcid: this._orcid,
      ORCiDJSON: this._ORCiDJSON,
      familyName: this._familyName,
      givenNames: this._givenNames,
      employments: this._employments.map(employment => JSON.stringify(employment.toObject())),
      preferredLocale: this._preferredLocale,
      biography: this._biography,
      emails: this._emails,
      keywords: this._keywords,
      researcherUrls: this._researcherUrls,
      country: this._country,
    };
  }
}

class Employment {
  /**
   * The start date of the employment.
   * @type {Date}
   */
  startDate: Date;

  /**
   * The end date of the employment.
   * If the employment is still ongoing, this is null.
   * @type {Date | null}
   */
  endDate: Date | null;

  /**
   * The organization of the employment.
   * @type {string}
   */
  organization: string;

  /**
   * The department of the employment.
   * @type {string}
   */
  department: string;

  constructor(startDate: Date, endDate: Date | null, organization: string, department: string) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.organization = organization;
    this.department = department;
  }

  static fromJSON(serialized: string): Employment {
    const data: ReturnType<Employment['toObject']> = JSON.parse(serialized);
    const startDate = new Date(data.startDate);
    const endDate = data.endDate === null ? null : new Date(data.endDate);
    return new Employment(startDate, endDate, data.organization, data.department);
  }

  toObject() {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
      organization: this.organization,
      department: this.department,
    };
  }
}
