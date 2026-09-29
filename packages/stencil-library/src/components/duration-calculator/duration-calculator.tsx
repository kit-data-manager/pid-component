import { Component, h, Prop, State } from '@stencil/core';
import { parseDuration } from '../../rendererModules/date-common/iso';
import { addDurationToIso, formatDurationParts } from '../../rendererModules/date-common/format';

/**
 * An interactive end-datetime calculator for ISO 8601 durations.
 *
 * It accepts an ISO duration string (e.g. `P7DT2H`), lets a user enter a start
 * datetime via a native `<input type="datetime-local">`, and on demand computes
 * and displays the corresponding end datetime, start plus the duration.
 */
@Component({
  tag: 'duration-calculator',
  shadow: true,
})
export class DurationCalculator {
  /** The ISO 8601 duration, e.g. "P7DT2H". */
  @Prop() isoDuration: string;

  /** The start datetime entered by the user (local wall-clock). */
  @State() startValue: string = '';
  @State() endValue: string | null = null;
  @State() error: string | null = null;

  private get parts() {
    return parseDuration(this.isoDuration);
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.startValue = target.value;
    // Reset the previous result whenever the input changes.
    this.endValue = null;
    this.error = null;
  }

  private calculate(): void {
    const parts = this.parts;
    if (!parts) {
      this.error = 'Invalid ISO 8601 duration.';
      return;
    }
    if (!this.startValue) {
      this.error = 'Please enter a start datetime.';
      return;
    }
    // Normalize the datetime-local value (no seconds) into an ISO string.
    const startIso = this.startValue.length === 16 ? this.startValue + ':00' : this.startValue;
    const end = addDurationToIso(startIso, parts);
    if (end === null) {
      this.error = 'Could not compute the end datetime from the given start.';
      return;
    }
    this.endValue = end;
    this.error = null;
  }

  render() {
    const parts = this.parts;
    if (!parts) {
      return <div>Invalid duration</div>;
    }

    return (
      <div class="duration-calculator">
        <p class="humanized">{formatDurationParts(parts)}</p>
        <label htmlFor="start-input">Start datetime</label>
        <input
          id="start-input"
          type="datetime-local"
          step="1"
          value={this.startValue}
          onInput={e => this.handleInput(e)}
          style={{ display: 'block', margin: '0.25rem 0', padding: '0.25rem', border: '1px solid #999', borderRadius: '4px' }}
        />
        <button
          type="button"
          onClick={() => this.calculate()}
          style={{ marginTop: '0.25rem', padding: '0.35rem 0.75rem', border: '1px solid #999', borderRadius: '4px', cursor: 'pointer' }}
        >
          Calculate end datetime
        </button>
        {this.error ? <p style={{ color: '#c53030', marginTop: '0.5rem' }}>{this.error}</p> : null}
        {this.endValue ? (
          <p style={{ marginTop: '0.5rem' }}>
            <strong>End datetime:</strong> {this.startValue}
            {' → '}
            {new Date(this.endValue).toLocaleString()}
          </p>
        ) : null}
      </div>
    );
  }
}
