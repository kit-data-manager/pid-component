import { Temporal as PolyfillTemporal } from '@js-temporal/polyfill';

/**
 * A canonical reference for the Temporal namespace type. This keeps the whole
 * date renderer suite type-checked against a single shape across all browsers,
 * regardless of whether native Temporal or the polyfill is in effect.
 */
export type TemporalLike = typeof PolyfillTemporal;

/**
 * The Temporal namespace to use at runtime.
 *
 * Prefers the native `Temporal` global when the host environment provides it
 * and falls back to the bundled `@js-temporal/polyfill` otherwise.
 *
 * Note: this is intentionally a **static** import (following the `isbn3`
 * precedent in this codebase) so Stencil bundles the polyfill into the
 * distributed component once. The wrapper packages (React/Angular/Vue) never
 * resolve `@js-temporal/polyfill` themselves, so a dynamic bare import — which
 * a consumer bundler would try to resolve — is deliberately avoided.
 */
const nativeTemporal = (globalThis as unknown as { Temporal?: TemporalLike }).Temporal;

export const Temporal: TemporalLike = nativeTemporal ?? PolyfillTemporal;
