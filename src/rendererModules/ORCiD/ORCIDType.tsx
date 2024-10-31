import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { ORCIDInfo } from './ORCIDInfo';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';

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

  get data(): string {
    return JSON.stringify(this._orcidInfo.toObject());
  }

  hasCorrectFormat(): boolean {
    return ORCIDInfo.isORCiD(this.value);
  }

  async init(data?: string): Promise<void> {
    if (data !== undefined) {
      // this._orcidInfo = new ORCIDInfo(data.orcid, data.ORCiDJSON, data.familyName, data.givenNames, data.employments, data.preferredLocale, data.biography, data.emails, data.keywords, data.researcherUrls, data.country);
      this._orcidInfo = ORCIDInfo.fromJSON(data);
      console.debug('reload ORCIDInfo from data', this._orcidInfo);
    } else {
      this._orcidInfo = await ORCIDInfo.getORCiDInfo(this.value);
      console.debug('load ORCIDInfo from API', this._orcidInfo);
    }

    if (this.settings) {
      for (const i of this.settings) {
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
          this._orcidInfo.orcid,
          'ORCiD is a free service for researchers to distinguish themselves by creating a unique personal identifier.',
          'https://orcid.org',
          undefined,
          true,
        ),
        new FoldableItem(1, 'Family Name', this._orcidInfo.familyName, 'The family name of the person.'),
      ],
    );

    try {
      const givenNames = this._orcidInfo.givenNames;
      if (givenNames) {
        new FoldableItem(2, 'Given Names', this._orcidInfo.givenNames.toString(), 'The given names of the person.');
      }
    } catch (e) {
      console.log('Failed to obtain given names from ORCiD record.', e);
    }

    this.actions.push(new FoldableAction(0, 'Open ORCiD profile', `https://orcid.org/${this._orcidInfo.orcid}`, 'primary'));

    try {
      const affiliations = this._orcidInfo.getAffiliationsAt(new Date(Date.now()));
      for (const data of affiliations) {
        const affiliation = this._orcidInfo.getAffiliationAsString(data);
        if (affiliation !== undefined && affiliation.length > 2)
          this.items.push(new FoldableItem(50, 'Current Affiliation', affiliation, 'The current affiliation of the person.', undefined, undefined, false));
      }
    } catch (e) {
      console.log('Failed to obtain affiliations from ORCiD record.', e);
    }

    if (
      this._orcidInfo.getAffiliationsAt(this.affiliationAt) !== this._orcidInfo.getAffiliationsAt(new Date()) &&
      this.affiliationAt.toLocaleDateString('en-US') !== new Date().toLocaleDateString('en-US')
    ) {
      const affiliationsThen = this._orcidInfo.getAffiliationsAt(this.affiliationAt);

      for (const data of affiliationsThen) {
        const affiliation = this._orcidInfo.getAffiliationAsString(data);
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
    if (this._orcidInfo.emails) {
      const primary = this._orcidInfo.emails.filter(email => email.primary)[0];
      const other = this._orcidInfo.emails.filter(email => !email.primary);

      // If there is a primary e-mail address, generate an item and an action to send email
      if (primary) {
        this.items.push(new FoldableItem(20, 'Primary E-Mail address', primary.email, 'The primary e-mail address of the person.'));
        this.actions.push(new FoldableAction(0, 'Send E-Mail', `mailto:${primary.email}`, 'secondary'));
      }

      // If there are other e-mail addresses, generate an item with a list of them
      if (other.length > 0)
        this.items.push(
          new FoldableItem(70, 'Other E-Mail addresses', other.map(email => email.email).join(', '), 'All other e-mail addresses of the person.', undefined, undefined, false),
        );

      if (this._orcidInfo.preferredLocale)
        this.items.push(new FoldableItem(25, 'Preferred Language', this._orcidInfo.preferredLocale, 'The preferred locale/language of the person.'));

      for (const url of this._orcidInfo.researcherUrls) {
        this.items.push(new FoldableItem(100, url.name, url.url, 'A link to a website specified by the person.'));
      }

      if (this._orcidInfo.keywords.length > 50)
        this.items.push(
          new FoldableItem(60, 'Keywords', this._orcidInfo.keywords.map(keyword => keyword.content).join(', '), 'Keywords specified by the person.', undefined, undefined, false),
        );

      if (this._orcidInfo.biography) this.items.push(new FoldableItem(200, 'Biography', this._orcidInfo.biography, 'The biography of the person.', undefined, undefined, false));

      if (this._orcidInfo.country) this.items.push(new FoldableItem(30, 'Country', this._orcidInfo.country, 'The country of the person.'));
    }
  }

  isResolvable(): boolean {
    return this._orcidInfo.ORCiDJSON !== undefined;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <span class={'inline-flex items-center font-mono flex-nowrap align-top'}>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class={'h-5 p-0.5 mr-1 flex-none items-center'}>
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
        <span class={'flex-none px-1 items-center'}>
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
    return 'ORCIDType';
  }
}
