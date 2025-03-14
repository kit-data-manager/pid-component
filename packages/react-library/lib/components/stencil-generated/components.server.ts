/**
 * This file was automatically generated by the Stencil React Output Target.
 * Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
 * Do __not__ import components from this file as server side rendered components
 * may not hydrate due to missing Stencil runtime. Instead, import these components through the generated 'components.ts'
 * file that re-exports all components with the 'use client' directive.
 */

/* eslint-disable */

import { ColorHighlight as ColorHighlightElement, defineCustomElement as defineColorHighlight } from "@kit-data-manager/pid-component/dist/components/color-highlight.js";
import { CopyButton as CopyButtonElement, defineCustomElement as defineCopyButton } from "@kit-data-manager/pid-component/dist/components/copy-button.js";
import { LocaleVisualization as LocaleVisualizationElement, defineCustomElement as defineLocaleVisualization } from "@kit-data-manager/pid-component/dist/components/locale-visualization.js";
import { PidComponent as PidComponentElement, defineCustomElement as definePidComponent } from "@kit-data-manager/pid-component/dist/components/pid-component.js";
import type { StencilReactComponent } from '@stencil/react-output-target/runtime';
import { createComponent, createSSRComponent } from '@stencil/react-output-target/runtime';
import React from 'react';

type ColorHighlightEvents = NonNullable<unknown>;

export const ColorHighlight: StencilReactComponent<ColorHighlightElement, ColorHighlightEvents> = typeof window !== 'undefined'
    ? /*@__PURE__*/ createComponent<ColorHighlightElement, ColorHighlightEvents>({
        tagName: 'color-highlight',
        elementClass: ColorHighlightElement,
        // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
        react: React,
        events: {} as ColorHighlightEvents,
        defineCustomElement: defineColorHighlight
    })
    : /*@__PURE__*/ createSSRComponent<ColorHighlightElement, ColorHighlightEvents>({
        tagName: 'color-highlight',
        properties: { text: 'text' },
        hydrateModule: import('@kit-data-manager/pid-component/hydrate')
    });

type CopyButtonEvents = NonNullable<unknown>;

export const CopyButton: StencilReactComponent<CopyButtonElement, CopyButtonEvents> = typeof window !== 'undefined'
    ? /*@__PURE__*/ createComponent<CopyButtonElement, CopyButtonEvents>({
        tagName: 'copy-button',
        elementClass: CopyButtonElement,
        // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
        react: React,
        events: {} as CopyButtonEvents,
        defineCustomElement: defineCopyButton
    })
    : /*@__PURE__*/ createSSRComponent<CopyButtonElement, CopyButtonEvents>({
        tagName: 'copy-button',
        properties: { value: 'value' },
        hydrateModule: import('@kit-data-manager/pid-component/hydrate')
    });

type LocaleVisualizationEvents = NonNullable<unknown>;

export const LocaleVisualization: StencilReactComponent<LocaleVisualizationElement, LocaleVisualizationEvents> = typeof window !== 'undefined'
    ? /*@__PURE__*/ createComponent<LocaleVisualizationElement, LocaleVisualizationEvents>({
        tagName: 'locale-visualization',
        elementClass: LocaleVisualizationElement,
        // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
        react: React,
        events: {} as LocaleVisualizationEvents,
        defineCustomElement: defineLocaleVisualization
    })
    : /*@__PURE__*/ createSSRComponent<LocaleVisualizationElement, LocaleVisualizationEvents>({
        tagName: 'locale-visualization',
        properties: {
            locale: 'locale',
            showFlag: 'show-flag'
        },
        hydrateModule: import('@kit-data-manager/pid-component/hydrate')
    });

type PidComponentEvents = NonNullable<unknown>;

export const PidComponent: StencilReactComponent<PidComponentElement, PidComponentEvents> = typeof window !== 'undefined'
    ? /*@__PURE__*/ createComponent<PidComponentElement, PidComponentEvents>({
        tagName: 'pid-component',
        elementClass: PidComponentElement,
        // @ts-ignore - React type of Stencil Output Target may differ from the React version used in the Nuxt.js project, this can be ignored.
        react: React,
        events: {} as PidComponentEvents,
        defineCustomElement: definePidComponent
    })
    : /*@__PURE__*/ createSSRComponent<PidComponentElement, PidComponentEvents>({
        tagName: 'pid-component',
        properties: {
            value: 'value',
            settings: 'settings',
            openByDefault: 'open-by-default',
            amountOfItems: 'amount-of-items',
            levelOfSubcomponents: 'level-of-subcomponents',
            currentLevelOfSubcomponents: 'current-level-of-subcomponents',
            hideSubcomponents: 'hide-subcomponents',
            emphasizeComponent: 'emphasize-component',
            showTopLevelCopy: 'show-top-level-copy',
            defaultTTL: 'default-t-t-l'
        },
        hydrateModule: import('@kit-data-manager/pid-component/hydrate')
    });
