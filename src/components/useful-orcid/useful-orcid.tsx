import {Component, Host, h, Prop, State} from '@stencil/core';
import {ORCIDInfo} from "../../utils/ORCIDInfo";
import {FoldableAction, FoldableItem} from "../foldable-component/foldable-component";
import {getLocaleDetail} from "../../utils/utils";

@Component({
  tag: 'useful-orcid',
  styleUrl: 'useful-orcid.css',
  shadow: true,
})
export class UsefulOrcid {
  /**
   * The ORCiD to display, evaluate and link in this component.
   * (required)
   * @type {string}
   */
  @Prop() orcid!: string;

  /**
   * Should the table inside the component change colors every other line?
   */
  @Prop() changingColors: boolean = true;

  /**
   * Should the details element be open by default?
   */
  @Prop() openStatus: boolean = false;

  /**
   * Whether to show the affiliation or not.
   * (optional) Defaults to true.
   * @type {boolean}
   */
  @Prop() showAffiliation: boolean = true;

  /**
   * Whether to show the department of the affiliation or not.
   * Depends internally on availability of the department in the ORCiD information.
   * (optional) Defaults to false.
   * @type {boolean}
   */
  @Prop() showDepartment: boolean = false;

  /**
   * Whether to show the ORCiD inline or not.
   * (optional) Defaults to false.
   * @type {boolean}
   */
  @Prop() showOrcid: boolean = false;

  /**
   * The date of the affiliation to display.
   * (optional) Defaults to the current date.
   * @type {Date}
   */
  @Prop() affiliationAt: Date = new Date(Date.now());

  /**
   * The private state of the ORCiD information.
   */
  @State() orcidInfo: ORCIDInfo;

  @State() items: FoldableItem[] = []

  @State() actions: FoldableAction[] = [{
    title: "Open ORCiD.org website",
    link: `https://orcid.org/${this.orcid}`,
    style: "primary"
  }]

  async connectedCallback() {
    // Parse ORCiD and retrieve information from ORCiD.org
    let parsed = await ORCIDInfo.getORCiDInfo(this.orcid);
    this.orcidInfo = parsed;

    // Generate items and actions
    this.items = [
      {
        keyTitle: "ORCiD",
        keyLink: `https://orcid.org`,
        keyTooltip: "ORCiD is a free service for researchers to distinguish themselves by creating a unique personal identifier.",
        value: parsed.orcid,
      }, {
        keyTitle: "Family Name",
        keyTooltip: "The family name of the person.",
        value: parsed.familyName,
      },
      {
        keyTitle: "Given Name",
        keyTooltip: "The given names of the person.",
        value: parsed.givenNames.toString(),
      },
      {
        keyTitle: "Current Affiliation",
        keyTooltip: "The current affiliation of the person.",
        value: parsed.getAffiliationAsString(parsed.getAffiliationsAt(new Date())[0], true),
      }
    ]

    if (parsed.getAffiliationsAt(this.affiliationAt) !== parsed.getAffiliationsAt(new Date(Date.now()))) {
      const affiliationsThen = parsed.getAffiliationsAt(this.affiliationAt);

      for (let data of affiliationsThen) {
        const affiliation = parsed.getAffiliationAsString(data)
        this.items.push({
          keyTitle: "Affiliation at " + this.affiliationAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric"
          }),
          keyTooltip: "The affiliation of the person at the given date.",
          value: affiliation,
        })
      }
    }

    if (parsed.emails) {
      let primary = parsed.emails.filter((email) => email.primary)[0];
      let other = parsed.emails.filter((email) => !email.primary);

      // If there is a primary e-mail address, generate an item and an action to send email
      if (primary) {
        this.items.push({
          keyTitle: "Primary E-Mail address",
          keyTooltip: "The primary e-mail address of the person.",
          value: primary.email,
        })
        this.actions.push({
          title: "Send E-Mail",
          link: `mailto:${primary.email}`,
          style: "secondary"
        })
      }

      // If there are other e-mail addresses, generate an item with a list of them
      if (other.length > 0) this.items.push({
        keyTitle: "Other E-Mail addresses",
        keyTooltip: "All other e-mail addresses of the person.",
        value: parsed.emails.map((email) => email.email).join(", "),
      })
    }

    if (parsed.preferredLocale) this.items.push({
      keyTitle: "Preferred Language",
      keyTooltip: "The preferred locale/language of the person.",
      value: getLocaleDetail(parsed.preferredLocale, "language"),
    })

    for (let url of parsed.researcherUrls) {
      this.items.push({
        keyTitle: url.name,
        keyTooltip: "A link to a website specified by the person.",
        value: url.url,
      })
    }

    if (parsed.keywords.length > 0) this.items.push({
      keyTitle: "Keywords",
      keyTooltip: "Keywords specified by the person.",
      value: parsed.keywords.map((keyword) => keyword.content).join(", "),
    })

    if (parsed.biography) this.items.push({
      keyTitle: "Biography",
      keyTooltip: "The biography of the person.",
      value: parsed.biography,
    })

    if (parsed.country) this.items.push({
      keyTitle: "Country",
      keyTooltip: "The country of the person.",
      value: getLocaleDetail(parsed.country, "region"),
    })

    console.log(this.orcidInfo);
    console.log(this.items);
  }

  render() {
    return (
      <Host class="inline-flex flex-grow w-fit max-w-screen-lg font-sans">
        {
          this.items.length > 0 ?
            <foldable-component openStatus={this.openStatus} changingColors={this.changingColors} items={this.items}
                                actions={this.actions}>
              <beautiful-orcid orcid={this.orcid} showAffiliation={this.showAffiliation}
                               showDepartment={this.showDepartment} affiliationAt={this.affiliationAt}
                               showOrcid={this.showOrcid}/>
            </foldable-component>
            : ""
        }
      </Host>
    );
  }

}
