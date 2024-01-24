import React from 'react';
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
    const regex = /^((\(.*\))?(\w|-|\+|_|\.)+(\(.*\))?@((((\(.*\))?\w+(\(.*\))?\.)+(\(.*\))?\w+(\(.*\))?\w+)|(\[((IPv6:((\w+:+)+\w+))|(\d+\.)+\d+)\]))\s*(,|$)\s*)+$/
    return regex.test(this.value);
  }

  init(): Promise<void> {
    return;
  }

  isResolvable(): boolean {
    return false;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <span>
        {React.Children.map(this.value.split(new RegExp(/\s*,\s*/)), (email, i) => {
          return <span> 
              {i > 0 && ", "}
              <a href={'mailto:' + email} target="_blank" class={'font-mono text-sm text-blue-400'}>
                {email}
              </a>
            </span>;
        })}
      </span>
    );
  }
}
