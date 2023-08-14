import {FunctionalComponent, h} from "@stencil/core";
import {GenericIdentifierType} from "./GenericIdentifierType";
import {FoldableItem} from "./FoldableItem";
import {FoldableAction} from "./FoldableAction";
import {ORCIDInfo} from "./ORCIDInfo";
import {getLocaleDetail} from "./utils";

export class ORCIDType extends GenericIdentifierType {

  private _orcidInfo: ORCIDInfo;
  private affiliationAt: Date = new Date(Date.now());
  private showAffiliation: boolean = true;
  private showDepartment: boolean = false;
  private showOrcid: boolean = false;

  hasCorrectFormat(): boolean {
    console.log("Checking if this is a ORCiD " + this.value);
    return ORCIDInfo.isORCiD(this.value);
  }

  async init(): Promise<void> {
    let parsed = await ORCIDInfo.getORCiDInfo(this.value);
    this._orcidInfo = parsed;

    console.log("Settings: ")
    console.log(this.settings);

    if (this.settings) {
      for (let i of this.settings) {
        console.log(i)
        switch (i["name"]) {
          case "showAffiliation":
            this.showAffiliation = i["value"];
            break;
          case "showDepartment":
            this.showDepartment = i["value"];
            break;
          case "showOrcid":
            this.showOrcid = i["value"];
            break;
          case "affiliationAt":
            this.affiliationAt = new Date(i["value"]);
            break;
        }
      }
    }

    // Generate items and actions

    this.items.push(...[
      new FoldableItem(0, "ORCiD", parsed.orcid, "ORCiD is a free service for researchers to distinguish themselves by creating a unique personal identifier.", "https://orcid.org", undefined, true),
      new FoldableItem(1, "Family Name", parsed.familyName, "The family name of the person."),
      new FoldableItem(2, "Given Names", parsed.givenNames.toString(), "The given names of the person."),
    ])

    this.actions.push(new FoldableAction(0, "Open ORCiD", `https://orcid.org/${parsed.orcid}`, "primary"))

    try {
      const affiliation = parsed.getAffiliationAtString(new Date(Date.now()), true)
      if (affiliation !== undefined && affiliation.length > 2) this.items.push(
        new FoldableItem(50, "Current Affiliation", affiliation, "The current affiliation of the person."),
      )
    } catch (e) {
      console.log(e);
    }

    if (parsed.getAffiliationAt(this.affiliationAt) !== parsed.getAffiliationAt(new Date(Date.now()))) {
      this.items.push(new FoldableItem(10, "Affiliation at " + this.affiliationAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric"
      }), parsed.getAffiliationAtString(this.affiliationAt, true), "The affiliation of the person at the given date."))
    }

    if (parsed.emails) {
      let primary = parsed.emails.filter((email) => email.primary)[0];
      let other = parsed.emails.filter((email) => !email.primary);

      // If there is a primary e-mail address, generate an item and an action to send email
      if (primary) {
        this.items.push(new FoldableItem(20, "Primary E-Mail address", primary.email, "The primary e-mail address of the person."))
        this.actions.push(new FoldableAction(0, "Send E-Mail", `mailto:${primary.email}`, "secondary"))
      }

      // If there are other e-mail addresses, generate an item with a list of them
      if (other.length > 0) this.items.push(new FoldableItem(70, "Other E-Mail addresses", other.map((email) => email.email).join(", "), "All other e-mail addresses of the person."))

      if (parsed.preferredLocale) this.items.push(new FoldableItem(25, "Preferred Language", getLocaleDetail(parsed.preferredLocale, "language"), "The preferred locale/language of the person."))

      for (let url of parsed.researcherUrls) {
        this.items.push(new FoldableItem(100, url.name, url.url, "A link to a website specified by the person."))
      }

      if (parsed.keywords.length > 50) this.items.push(new FoldableItem(60, "Keywords", parsed.keywords.map((keyword) => keyword.content).join(", "), "Keywords specified by the person."))

      if (parsed.biography) this.items.push(new FoldableItem(200, "Biography", parsed.biography, "The biography of the person."))

      if (parsed.country) this.items.push(new FoldableItem(30, "Country", getLocaleDetail(parsed.country, "region"), "The country of the person."))

      console.log(this._orcidInfo);
    }
  }

  isResolvable(): boolean {
    return this._orcidInfo.ORCiDJSON !== undefined;
  }

  renderBody(): FunctionalComponent<any> {
    return undefined;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <beautiful-orcid orcid={this._orcidInfo.orcid} showAffiliation={this.showAffiliation}
                       showDepartment={this.showDepartment} affiliationAt={this.affiliationAt}
                       showOrcid={this.showOrcid}/>
    )
  }

  getSettingsKey(): string {
    return "ORCIDConfig";
  }
}
