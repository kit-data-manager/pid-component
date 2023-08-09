import {Component, Host, h, Prop, State} from '@stencil/core';
// @ts-ignore
import {ORCIDInfo} from '../../utils/ORCIDInfo';

@Component({
  tag: 'beautiful-orcid',
  shadow: true,
  styleUrl: 'beautiful-orcid.css'
})
export class BeautifulOrcid {
  /**
   * The ORCiD to display, evaluate and link in this component.
   * (required)
   * @type {string}
   */
  @Prop() orcid!: string;

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

  async connectedCallback() {
    this.orcidInfo = await ORCIDInfo.getORCiDInfo(this.orcid);
    console.log(this.orcidInfo);
  }

  render() {
    return <Host>
      <a href={`https://orcid.org/${this.orcid}`}
         class={"bg-white hover:bg-gray-50 border shadow-md rounded-md inline-flex flex-row flex-nowrap items-center text-clip align-bottom"}
         target={"_blank"}>
        <span class={"border-r px-0.5 rounded bg-white"}>
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
               class={"h-5 p-0.5 items-center self-stretch"}>
            <path class="st0"
                  d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z"/>
            <g>
              <path class="st1" d="M86.3,186.2H70.9V79.1h15.4v48.4V186.2z"/>
              <path class="st1" d="M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5
                        c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z"/>
              <path class="st1" d="M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1
                        C84.2,46.7,88.7,51.3,88.7,56.8z"/>
            </g>
          </svg>
      </span>
        {
          this.orcidInfo !== undefined
            ?
            <span class="flex-nowrap font-mono text-sm px-1.5 font-medium hover:text-blue-400 divide-x">
              {this.orcidInfo.familyName}, {this.orcidInfo.givenNames}
              {this.orcidInfo.getAffiliationAt(this.affiliationAt) !== undefined && this.showAffiliation
                ? ` (${this.orcidInfo.getAffiliationAtString(this.affiliationAt, this.showDepartment)}${this.showOrcid ? ", " : ""}`
                : this.showOrcid ? " (" : ""}
              {this.showOrcid
                ? <span class={"hover:text-[#A6CE39]"}>{this.orcidInfo.orcid}</span>
                : ""}
              {(this.orcidInfo.getAffiliationAt(this.affiliationAt) !== undefined && this.showAffiliation) || this.showOrcid ? ")" : ""}
            </span>
            : ""
        }
      </a>
    </Host>
  }
}
