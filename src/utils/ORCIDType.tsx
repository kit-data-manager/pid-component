import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from './GenericIdentifierType';
import { FoldableItem } from './FoldableItem';
import { FoldableAction } from './FoldableAction';
import { ORCIDInfo } from './ORCIDInfo';
import { getLocaleDetail } from './utils';

/**
 * This class specifies a custom renderer for ORCiDs.
 * @extends GenericIdentifierType
 */
export class ORCIDType extends GenericIdentifierType {
  /**
   * The ORCIDInfo object.
   * @type {ORCIDInfo}
   * @private
   */
  private _orcidInfo: ORCIDInfo;

  /**
   * The date at which the affiliation should be shown.
   * @type {Date}
   * @default new Date(Date.now())
   * @private
   */
  private affiliationAt: Date = new Date(Date.now());

  /**
   * Whether the affiliation should be shown at all.
   * @type {boolean}
   * @default true
   * @private
   */
  private showAffiliation: boolean = true;

  hasCorrectFormat(): boolean {
    return ORCIDInfo.isORCiD(this.value);
  }

  async init(): Promise<void> {
    let parsed = await ORCIDInfo.getORCiDInfo(this.value);
    this._orcidInfo = parsed;

    if (this.settings) {
      for (let i of this.settings) {
        switch (i['name']) {
          case 'affiliationAt':
            this.affiliationAt = new Date(i['value']);
            break;
          case 'showAffiliation':
            this.showAffiliation = i['value'];
            break;
        }
      }
    }

    // Generate items and actions

    this.items.push(
      ...[
        new FoldableItem(
          0,
          'ORCiD',
          parsed.orcid,
          'ORCiD is a free service for researchers to distinguish themselves by creating a unique personal identifier.',
          'https://orcid.org',
          undefined,
          true,
        ),
        new FoldableItem(1, 'Family Name', parsed.familyName, 'The family name of the person.'),
        new FoldableItem(2, 'Given Names', parsed.givenNames.toString(), 'The given names of the person.'),
      ],
    );

    this.actions.push(new FoldableAction(0, 'Open ORCiD profile', `https://orcid.org/${parsed.orcid}`, 'primary'));

    try {
      const affiliations = parsed.getAffiliationsAt(new Date(Date.now()));
      for (let data of affiliations) {
        const affiliation = parsed.getAffiliationAsString(data);
        if (affiliation !== undefined && affiliation.length > 2)
          this.items.push(new FoldableItem(50, 'Current Affiliation', affiliation, 'The current affiliation of the person.', undefined, undefined, false));
      }
    } catch (e) {
      console.log(e);
    }

    if (
      parsed.getAffiliationsAt(this.affiliationAt) !== parsed.getAffiliationsAt(new Date()) &&
      this.affiliationAt.toLocaleDateString('en-US') !== new Date().toLocaleDateString('en-US')
    ) {
      const affiliationsThen = parsed.getAffiliationsAt(this.affiliationAt);

      for (let data of affiliationsThen) {
        const affiliation = parsed.getAffiliationAsString(data);
        this.items.push(
          new FoldableItem(
            49,
            'Affiliation at ' +
              this.affiliationAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }),
            affiliation,
            'The affiliation of the person at the given date.',
            undefined,
            undefined,
            false,
          ),
        );
      }
    }
    if (parsed.emails) {
      let primary = parsed.emails.filter(email => email.primary)[0];
      let other = parsed.emails.filter(email => !email.primary);

      // If there is a primary e-mail address, generate an item and an action to send email
      if (primary) {
        this.items.push(new FoldableItem(20, 'Primary E-Mail address', primary.email, 'The primary e-mail address of the person.'));
        this.actions.push(new FoldableAction(0, 'Send E-Mail', `mailto:${primary.email}`, 'secondary'));
      }

      // If there are other e-mail addresses, generate an item with a list of them
      if (other.length > 0)
        this.items.push(new FoldableItem(70, 'Other E-Mail addresses', other.map(email => email.email).join(', '), 'All other e-mail addresses of the person.', undefined, undefined, false));

      if (parsed.preferredLocale)
        this.items.push(
          new FoldableItem(
            25,
            'Preferred Language',
            getLocaleDetail(parsed.preferredLocale, 'language'),
            'The preferred locale/language of the person.',
            undefined,
            undefined,
            false,
          ),
        );

      for (let url of parsed.researcherUrls) {
        this.items.push(new FoldableItem(100, url.name, url.url, 'A link to a website specified by the person.'));
      }

      if (parsed.keywords.length > 50)
        this.items.push(
          new FoldableItem(60, 'Keywords', parsed.keywords.map(keyword => keyword.content).join(', '), 'Keywords specified by the person.', undefined, undefined, false),
        );

      if (parsed.biography) this.items.push(new FoldableItem(200, 'Biography', parsed.biography, 'The biography of the person.', undefined, undefined, false));

      if (parsed.country) this.items.push(new FoldableItem(30, 'Country', getLocaleDetail(parsed.country, 'region'), 'The country of the person.', undefined, undefined, false));

      console.log(this._orcidInfo);
    }
  }

  isResolvable(): boolean {
    return this._orcidInfo.ORCiDJSON !== undefined;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <span class={'inline-flex items-center font-mono px-1 flex-nowrap align-top max-w-md truncate overflow-x-scroll'}>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class={'h-5 p-0.5 mr-2 flex-none'}>
          <style type="text/css">
            {`.st0{fill:#A6CE39;}`}
            {`.st1{fill:#FFFFFF;}`}
          </style>
          <path class="st0" d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z" />
          <g>
            <path class="st1" d="M86.3,186.2H70.9V79.1h15.4v48.4V186.2z" />
            <path
              class="st1"
              d="M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5
                        c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z"
            />
            <path
              class="st1"
              d="M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1
                        C84.2,46.7,88.7,51.3,88.7,56.8z"
            />
          </g>
        </svg>
        <span class={'flex-none overflow-x-scroll max-w-lg truncate'}>
          {this._orcidInfo.familyName}, {this._orcidInfo.givenNames}{' '}
          {this.showAffiliation && this._orcidInfo.getAffiliationsAt(new Date()).length > 0
            ? `(${this._orcidInfo.getAffiliationAsString(this._orcidInfo.getAffiliationsAt(new Date())[0], false)}${
                this._orcidInfo.getAffiliationsAt(this.affiliationAt).length > 0 &&
                this.affiliationAt.toLocaleDateString() !== new Date().toLocaleDateString() &&
                this._orcidInfo.getAffiliationsAt(this.affiliationAt)[0].organization !== this._orcidInfo.getAffiliationsAt(new Date())[0].organization
                  ? `, then: ${this._orcidInfo.getAffiliationsAt(this.affiliationAt)[0].organization}`
                  : ''
              })`
            : ''}
        </span>
      </span>
    );
  }

  getSettingsKey(): string {
    return 'ORCIDConfig';
  }
}
