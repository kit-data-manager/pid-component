import { Component, h, Prop, State } from '@stencil/core';
import { parseDuration } from '../../rendererModules/date-common/iso';
import { addDurationToIso, subtractDurationFromIso } from '../../rendererModules/date-common/format';

/**
 * A compact end-datetime calculator for ISO 8601 durations.
 *
 * It accepts an ISO duration string (e.g. `P7DT2H`) and shows a single row with
 * a start datetime input on the left, two direction arrow buttons in the middle,
 * and an end datetime input on the right. Clicking the right arrow (→) computes
 * the end datetime from the start; clicking the left arrow (←) computes the
 * start datetime from the end. The computed input is highlighted with a green
 * border so the result stands out.
 */
@Component({
  tag: 'duration-calculator',
  shadow: true,
})
export class DurationCalculator {
  /** The ISO 8601 duration, e.g. "P7DT2H". */
  @Prop() isoDuration: string;

  /** Whether the calculator should use dark-mode styling. */
  @Prop() darkMode: boolean = false;

  /** The start datetime entered by the user (local wall-clock). */
  @State() startValue: string = '';
  /** The end datetime (editable, local wall-clock). */
  @State() endValue: string = '';
  /** Which input received a freshly computed result (green border). */
  @State() highlight: 'start' | 'end' | null = null;
  @State() error: string | null = null;

  private get parts() {
    return parseDuration(this.isoDuration);
  }

  private handleStartInput(event: Event): void {
    this.startValue = (event.target as HTMLInputElement).value;
    this.highlight = null;
    this.error = null;
  }

  private handleEndInput(event: Event): void {
    this.endValue = (event.target as HTMLInputElement).value;
    this.highlight = null;
    this.error = null;
  }

  /** Compute the end datetime from the start datetime (+ the duration). */
  private calculateEnd(): void {
    const parts = this.parts;
    if (!parts) {
      this.error = 'Invalid ISO 8601 duration.';
      return;
    }
    if (!this.startValue) {
      this.error = 'Please enter a start datetime.';
      return;
    }
    const startIso = toIsoInput(this.startValue);
    const end = addDurationToIso(startIso, parts);
    if (end === null) {
      this.error = 'Could not compute the end datetime from the given start.';
      return;
    }
    this.endValue = toInputValue(end);
    this.highlight = 'end';
    this.error = null;
  }

  /** Compute the start datetime from the end datetime (− the duration). */
  private calculateStart(): void {
    const parts = this.parts;
    if (!parts) {
      this.error = 'Invalid ISO 8601 duration.';
      return;
    }
    if (!this.endValue) {
      this.error = 'Please enter an end datetime.';
      return;
    }
    const endIso = toIsoInput(this.endValue);
    const start = subtractDurationFromIso(endIso, parts);
    if (start === null) {
      this.error = 'Could not compute the start datetime from the given end.';
      return;
    }
    this.startValue = toInputValue(start);
    this.highlight = 'start';
    this.error = null;
  }

  render() {
    const parts = this.parts;
    if (!parts) {
      return <div>Invalid duration</div>;
    }

    const inputBase = this.darkMode
      ? { padding: '0.35rem' as const, border: '1px solid #4b5563' as const, borderRadius: '4px' as const, background: '#1f2937' as const, color: '#f9fafb' as const }
      : { padding: '0.35rem' as const, border: '1px solid #9ca3af' as const, borderRadius: '4px' as const };
    const inputStyle = (highlighted: boolean) =>
      ({
        flex: '1 1 auto',
        minWidth: '0',
        ...inputBase,
        ...(highlighted ? { boxShadow: `0 0 0 2px ${this.darkMode ? '#4ade80' : '#16a34a'}` } : {}),
      } as const);

    const arrowButtonStyle = {
      flex: '1 1 0',
      minWidth: '2rem',
      padding: '0.25rem 0.4rem',
      border: '1px solid #6b7280',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      lineHeight: '1',
      color: this.darkMode ? '#f9fafb' : '#1f2937',
      background: this.darkMode ? '#1f2937' : '#f9fafb',
    } as const;

    const errorStyle = {
      color: this.darkMode ? '#fc8181' : '#c53030',
      margin: '0.25rem 0 0',
      fontSize: '0.8rem',
    } as const;

    return (
      <div class="duration-calculator">
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0.5rem',
          }}
        >
          <input
            id="start-input"
            type="datetime-local"
            step="1"
            aria-label="Start datetime"
            value={this.startValue}
            onInput={e => this.handleStartInput(e)}
            style={inputStyle(this.highlight === 'start')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '0 0 auto' }}>
            <button
              type="button"
              title="Compute end datetime from the start datetime"
              aria-label="Compute end datetime from the start datetime"
              onClick={() => this.calculateEnd()}
              style={arrowButtonStyle}
            >
              &rarr;
            </button>
            <button
              type="button"
              title="Compute start datetime from the end datetime"
              aria-label="Compute start datetime from the end datetime"
              onClick={() => this.calculateStart()}
              style={arrowButtonStyle}
            >
              &larr;
            </button>
          </div>
          <input
            id="end-input"
            type="datetime-local"
            step="1"
            aria-label="End datetime"
            value={this.endValue}
            onInput={e => this.handleEndInput(e)}
            style={inputStyle(this.highlight === 'end')}
          />
        </div>
        {this.error ? <p role="alert" style={errorStyle}>{this.error}</p> : null}
      </div>
    );
  }
}

/** Normalizes a datetime-local input value into a parseable ISO local datetime. */
function toIsoInput(value: string): string {
  // A datetime-local value of the form YYYY-MM-DDTHH:MM has no seconds.
  return value.length === 16 ? value + ':00' : value;
}

/** Formats a computed ISO local datetime for display in a datetime-local input. */
function toInputValue(iso: string): string {
  // Drop fractional seconds, then a trailing ':00' seconds if present so the
  // value reads as clean minutes (matching what a user would type).
  const cleaned = iso.replace(/\.\d+$/, '');
  return cleaned.replace(/:(\d{2}):00$/, ':$1');
}
