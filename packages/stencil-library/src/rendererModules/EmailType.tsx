import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';

/**
 * This class specifies a custom renderer for Email addresses.
 * @extends GenericIdentifierType
 */
export class EmailType extends GenericIdentifierType {
  getSettingsKey(): string {
    return 'EmailType';
  }

  private static readonly FORMAT_REGEX = /^(([\w\-.]+@([\w-]+\.)+[\w-]{2,})(\s*,\s*)?)+$/gm;

  quickCheck(): boolean {
    EmailType.FORMAT_REGEX.lastIndex = 0;
    return this.value.length > 0 && EmailType.FORMAT_REGEX.test(this.value);
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    return Promise.resolve(true);
  }

  init(): Promise<void> {
    return;
  }

  renderPreview(): FunctionalComponent {
    // mail icon from: https://heroicons.com/ (MIT license)
    return (
      <span class={`inline-flex gap-2 font-mono text-sm text-blue-400 hover:text-blue-500`}>
        {this.value
          .split(new RegExp(/\s*,\s*/))
          .filter(email => email.length > 0)
          .map(email => {
            return (
              <a
                href={'mailto:' + email}
                rel={'noopener noreferrer'}
                target="_blank"
              >
                {email}
              </a>
            );
          })}
      </span>
    );
  }
}
