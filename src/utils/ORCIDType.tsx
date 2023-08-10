import {FunctionalComponent, h} from "@stencil/core";
import {GenericIdentifierType} from "./GenericIdentifierType";
import {FoldableItem} from "./FoldableItem";
import {FoldableAction} from "./FoldableAction";
import {ORCIDInfo} from "./ORCIDInfo";
import {getLocaleDetail} from "./utils";

export class ORCIDType extends GenericIdentifierType {

  private _orcidInfo: ORCIDInfo;

  hasCorrectFormat(): boolean {
    console.log("Checking if this is a ORCiD " + this.value);
    return ORCIDInfo.isORCiD(this.value);
  }

  async init(): Promise<void> {
    let parsed = await ORCIDInfo.getORCiDInfo(this.value);
    this._orcidInfo = parsed;

    // Generate items and actions

    this.items.push(...[
      new FoldableItem(0, "ORCiD", parsed.orcid, "ORCiD is a free service for researchers to distinguish themselves by creating a unique personal identifier.", "https://orcid.org"),
      new FoldableItem(0, "Family Name", parsed.familyName, "The family name of the person."),
      new FoldableItem(0, "Given Names", parsed.givenNames.toString(), "The given names of the person."),
      new FoldableItem(0, "Current Affiliation", parsed.getAffiliationAtString(new Date(Date.now()), true), "The current affiliation of the person."),
    ])

    // if (parsed.getAffiliationAt(this.affiliationAt) !== parsed.getAffiliationAt(new Date(Date.now()))) {
    //   this.items.push({
    //     keyTitle: "Affiliation at " + this.affiliationAt.toLocaleDateString("en-US", {
    //       year: "numeric",
    //       month: "numeric",
    //       day: "numeric"
    //     }),
    //     keyTooltip: "The affiliation of the person at the given date.",
    //     value: parsed.getAffiliationAtString(this.affiliationAt, true),
    //   })
    // }

    if (parsed.emails) {
      let primary = parsed.emails.filter((email) => email.primary)[0];
      let other = parsed.emails.filter((email) => !email.primary);

      // If there is a primary e-mail address, generate an item and an action to send email
      if (primary) {
        this.items.push(new FoldableItem(0, "Primary E-Mail address", primary.email, "The primary e-mail address of the person."))
        this.actions.push(new FoldableAction(0, "Send E-Mail", `mailto:${primary.email}`, "secondary"))
      }

      // If there are other e-mail addresses, generate an item with a list of them
      if (other.length > 0) this.items.push(new FoldableItem(0, "Other E-Mail addresses", other.map((email) => email.email).join(", "), "All other e-mail addresses of the person."))

      if (parsed.preferredLocale) this.items.push(new FoldableItem(0, "Preferred Language", getLocaleDetail(parsed.preferredLocale, "language"), "The preferred locale/language of the person."))

      for (let url of parsed.researcherUrls) {
        this.items.push(new FoldableItem(0, url.name, url.url, "A link to a website specified by the person."))
      }

      if (parsed.keywords.length > 0) this.items.push(new FoldableItem(0, "Keywords", parsed.keywords.map((keyword) => keyword.content).join(", "), "Keywords specified by the person."))

      if (parsed.biography) this.items.push(new FoldableItem(0, "Biography", parsed.biography, "The biography of the person."))

      if (parsed.country) this.items.push(new FoldableItem(0, "Country", getLocaleDetail(parsed.country, "region"), "The country of the person."))

      console.log(this._orcidInfo);
      console.log(this.items);
      return Promise.resolve(undefined);
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
      // <beautiful-orcid orcid={this._orcidInfo.orcid} showAffiliation={this.showAffiliation}
      //                  showDepartment={this.showDepartment} affiliationAt={this.affiliationAt}
      //                  showOrcid={this.showOrcid}/>
      <beautiful-orcid orcid={this._orcidInfo.orcid}/>
    )
  }

  getSettingsKey(): string {
    return "ORCIDConfig";
  }
}
