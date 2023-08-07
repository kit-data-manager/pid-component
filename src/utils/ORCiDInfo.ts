/**
 * This file contains the ORCiDInfo class, which is used to store information about an ORCiD.
 */
export class ORCiDInfo {

  /**
   * The ORCiD of the person.
   * @private
   */
  private readonly _orcid: string;

  /**
   * The family name of the person.
   * @private
   */
  private readonly _familyName: string;

  /**
   * The given names of the person.
   * @private
   */
  private readonly _givenNames: string[];

  /**
   * A list of employments of the person.
   * It is a list of objects, each containing the start date, end date, organization and department of the employment.
   * @private
   */
  private readonly _employments: {

    /**
     * The start date of the employment.
     */
    startDate: Date,

    /**
     * The end date of the employment.
     * If the employment is still ongoing, this is null.
     */
    endDate: Date | null,

    /**
     * The organization of the employment.
     */
    organization: string,

    /**
     * The department of the employment.
     */
    department: string,
  }[];

  /**
   * The raw JSON data received from the ORCiD API.
   * @private
   */
  private readonly _ORCiDJSON: object;

  constructor(orcid: string, familyName: string, givenNames: string[], employments: {
    startDate: Date,
    endDate: Date | null,
    organization: string,
    department: string,
  }[], ORCiDJSON: object) {
    this._orcid = orcid;
    this._familyName = familyName;
    this._givenNames = givenNames;
    this._employments = employments;
    this._ORCiDJSON = ORCiDJSON;
  }

  /**
   * Outputs the ORCiD of the person.
   */
  get orcid(): string {
    return this._orcid;
  }

  /**
   * Outputs the family name of the person.
   */
  get familyName(): string {
    return this._familyName;
  }

  /**
   * Outputs the given names of the person.
   */
  get givenNames(): string[] {
    return this._givenNames;
  }

  /**
   * Outputs the raw JSON data received from the ORCiD API.
   */
  get ORCiDJSON(): object {
    return this._ORCiDJSON;
  }

  /**
   * Outputs the list of employments of the person.
   */
  get employments(): {
    startDate: Date,
    endDate: Date | null,
    organization: string,
    department: string
  }[] {
    return this._employments;
  }

  /**
   * Outputs the employment object of the person at a given date.
   * @param date The date to check.
   */
  getAffiliationAt(date: Date): {
    startDate: Date,
    endDate: Date | null,
    organization: string,
    department: string,
  } | undefined {
    for (const employment of this._employments) {
      if (employment.startDate <= date && employment.endDate === null) return employment;
      if (employment.startDate <= date && employment.endDate !== null && employment.endDate >= date) return employment;
    }
    return undefined;
  }

  getAffiliationAtString(date: Date, showDepartment: boolean = true): string | undefined {
    const affiliation = this.getAffiliationAt(date);
    if (affiliation === undefined || affiliation.organization === null) return undefined;
    else {
      if (showDepartment && affiliation.department !== null) return `${affiliation.organization} [${affiliation.department}]`;
      else return affiliation.organization;
    }
  }

  /**
   * Checks if a string has the format of an ORCiD.
   * @param text The string to check.
   */
  static isORCiD(text: string): boolean {
    return text.match("^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$") !== null;
  }

  /**
   * Fetches the ORCiD data for a given ORCiD and returns it as an ORCiDInfo object.
   * @param orcid The ORCiD to fetch the data for.
   */
  static async getORCiDInfo(orcid: string): Promise<ORCiDInfo> {
    if (!ORCiDInfo.isORCiD(orcid)) throw new Error("Invalid input");

    console.log("Fetching ORCID data for " + orcid);
    const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}`, {
      headers: {
        "Accept": "application/json",
        // "Access-Control-Allow-Origin": "orcid.org"
      }
    })
    const rawOrcidJSON = await response.json();
    console.log(rawOrcidJSON);

    const familyName = rawOrcidJSON["person"]["name"]["family-name"]["value"];
    const givenNames = rawOrcidJSON["person"]["name"]["given-names"]["value"];

    const affiliations = rawOrcidJSON["activities-summary"]["employments"]["affiliation-group"];
    let employments: {
      startDate: Date,
      endDate: Date | null,
      organization: string,
      department: string,
    }[] = [];

    for (let i = 0; i < affiliations.length; i++) {
      const employmentSummary = affiliations[i]["summaries"][0]["employment-summary"];
      let employment = {
        startDate: new Date(),
        endDate: null,
        organization: null,
        department: null
      }

      if (employmentSummary["start-date"] !== null) employment.startDate = new Date(employmentSummary["start-date"]["year"]["value"], employmentSummary["start-date"]["month"]["value"], employmentSummary["start-date"]["day"]["value"]);
      if (employmentSummary["end-date"] !== null) employment.endDate = new Date(employmentSummary["end-date"]["year"]["value"], employmentSummary["end-date"]["month"]["value"], employmentSummary["end-date"]["day"]["value"]);
      employment.organization = employmentSummary["organization"]["name"];
      employment.department = employmentSummary["department-name"];

      employments.push(employment);
    }

    return new ORCiDInfo(orcid, familyName, givenNames, employments, rawOrcidJSON);
  }
}
