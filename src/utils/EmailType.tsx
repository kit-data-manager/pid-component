import { GenericIdentifierType } from './GenericIdentifierType';
import { FunctionalComponent, h } from '@stencil/core';

/**
 * This class specifies a custom renderer for Email addresses.
 * @extends GenericIdentifierType
 */
export class EmailType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'EmailType';
  }

  hasCorrectFormat(): boolean {
    const regex = /^((\(.*\))?(\w|-|\+|_|\.)+(\(.*\))?@((((\(.*\))?\w+(\(.*\))?\.)+(\(.*\))?\w+(\(.*\))?\w+)|(\[((IPv6:((\w+:+)+\w+))|(\d+\.)+\d+)\]))\s*(,+|$)\s*)+$/
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    // mail icon from: https://heroicons.com/ (MIT license)
    return (
      <span class={'flex inline'}>
        {this.value.split(new RegExp(/\s*,\s*/)).filter(email => email.length > 0).map(email => {
          return (
            <a href={'mailto:' + email} target='_blank' class={'flex inline font-mono text-sm text-blue-400 border border-slate-500 rounded-md px-1 py-2 mr-2'}>
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' aria-hidden='true' viewBox='0 0 24 24' stroke-width='1' stroke='black' height='20px' class={'mr-1'}>
                <path stroke-linecap='round' stroke-linejoin='round' d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75' />
              </svg>
              <span class={'ml-2'}>
                {email}
              </span>
            </a>
          );
        })}
      </span>
    );
  }
}
