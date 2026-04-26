/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils';

import type { Components } from '@kit-data-manager/pid-component/components';

import { defineCustomElement as defineColorHighlight } from '@kit-data-manager/pid-component/components/color-highlight.js';
import { defineCustomElement as defineCopyButton } from '@kit-data-manager/pid-component/components/copy-button.js';
import { defineCustomElement as defineJsonViewer } from '@kit-data-manager/pid-component/components/json-viewer.js';
import { defineCustomElement as defineLocaleVisualization } from '@kit-data-manager/pid-component/components/locale-visualization.js';
import { defineCustomElement as definePidActions } from '@kit-data-manager/pid-component/components/pid-actions.js';
import { defineCustomElement as definePidCollapsible } from '@kit-data-manager/pid-component/components/pid-collapsible.js';
import { defineCustomElement as definePidComponent } from '@kit-data-manager/pid-component/components/pid-component.js';
import { defineCustomElement as definePidDataTable } from '@kit-data-manager/pid-component/components/pid-data-table.js';
import { defineCustomElement as definePidPagination } from '@kit-data-manager/pid-component/components/pid-pagination.js';
import { defineCustomElement as definePidTooltip } from '@kit-data-manager/pid-component/components/pid-tooltip.js';
@ProxyCmp({
  defineCustomElementFn: defineColorHighlight,
  inputs: ['text']
})
@Component({
  selector: 'color-highlight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'text', required: true }],
})
export class ColorHighlight {
  protected el: HTMLColorHighlightElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface ColorHighlight extends Components.ColorHighlight {}


@ProxyCmp({
  defineCustomElementFn: defineCopyButton,
  inputs: ['label', 'value']
})
@Component({
  selector: 'copy-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['label', { name: 'value', required: true }],
})
export class CopyButton {
  protected el: HTMLCopyButtonElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface CopyButton extends Components.CopyButton {}


@ProxyCmp({
  defineCustomElementFn: defineJsonViewer,
  inputs: ['data', 'expandAll', 'maxHeight', 'showLineNumbers', 'theme', 'viewMode'],
  methods: ['expandAllNodes', 'collapseAllNodes']
})
@Component({
  selector: 'json-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['data', 'expandAll', 'maxHeight', 'showLineNumbers', 'theme', 'viewMode'],
})
export class JsonViewer {
  protected el: HTMLJsonViewerElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface JsonViewer extends Components.JsonViewer {}


@ProxyCmp({
  defineCustomElementFn: defineLocaleVisualization,
  inputs: ['locale', 'showFlag']
})
@Component({
  selector: 'locale-visualization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'locale', required: true }, 'showFlag'],
})
export class LocaleVisualization {
  protected el: HTMLLocaleVisualizationElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface LocaleVisualization extends Components.LocaleVisualization {}


@ProxyCmp({
  defineCustomElementFn: definePidActions,
  inputs: ['actions', 'actionsId', 'darkMode']
})
@Component({
  selector: 'pid-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['actions', 'actionsId', 'darkMode'],
})
export class PidActions {
  protected el: HTMLPidActionsElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PidActions extends Components.PidActions {}


@ProxyCmp({
  defineCustomElementFn: definePidCollapsible,
  inputs: ['darkMode', 'emphasize', 'expanded', 'initialHeight', 'initialWidth', 'lineHeight', 'open', 'showFooter'],
  methods: ['recalculateContentDimensions']
})
@Component({
  selector: 'pid-collapsible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['darkMode', 'emphasize', 'expanded', 'initialHeight', 'initialWidth', 'lineHeight', 'open', 'showFooter'],
  outputs: ['collapsibleToggle', 'contentHeightChange'],
})
export class PidCollapsible {
  protected el: HTMLPidCollapsibleElement;
  @Output() collapsibleToggle = new EventEmitter<CustomEvent<boolean>>();
  @Output() contentHeightChange = new EventEmitter<CustomEvent<{ maxHeight: number }>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PidCollapsible extends Components.PidCollapsible {
  /**
   * Event emitted when the collapsible is toggled
   */
  collapsibleToggle: EventEmitter<CustomEvent<boolean>>;
  /**
   * Event emitted when content dimensions need to be recalculated
Useful for pagination to ensure proper height
   */
  contentHeightChange: EventEmitter<CustomEvent<{ maxHeight: number }>>;
}


@ProxyCmp({
  defineCustomElementFn: definePidComponent,
  inputs: ['amountOfItems', 'currentLevelOfSubcomponents', 'darkMode', 'defaultTTL', 'emphasizeComponent', 'fallbackToAll', 'height', 'hideSubcomponents', 'levelOfSubcomponents', 'openByDefault', 'renderers', 'settings', 'showTopLevelCopy', 'value', 'width']
})
@Component({
  selector: 'pid-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['amountOfItems', 'currentLevelOfSubcomponents', 'darkMode', 'defaultTTL', 'emphasizeComponent', 'fallbackToAll', 'height', 'hideSubcomponents', 'levelOfSubcomponents', 'openByDefault', 'renderers', 'settings', 'showTopLevelCopy', 'value', 'width'],
})
export class PidComponent {
  protected el: HTMLPidComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PidComponent extends Components.PidComponent {}


@ProxyCmp({
  defineCustomElementFn: definePidDataTable,
  inputs: ['currentLevelOfSubcomponents', 'currentPage', 'darkMode', 'hideSubcomponents', 'items', 'itemsPerPage', 'levelOfSubcomponents', 'loadSubcomponents', 'pageSizes', 'settings']
})
@Component({
  selector: 'pid-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['currentLevelOfSubcomponents', 'currentPage', 'darkMode', 'hideSubcomponents', 'items', 'itemsPerPage', 'levelOfSubcomponents', 'loadSubcomponents', 'pageSizes', 'settings'],
  outputs: ['pageChange', 'itemsPerPageChange'],
})
export class PidDataTable {
  protected el: HTMLPidDataTableElement;
  @Output() pageChange = new EventEmitter<CustomEvent<number>>();
  @Output() itemsPerPageChange = new EventEmitter<CustomEvent<number>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PidDataTable extends Components.PidDataTable {
  /**
   * Event emitted when page changes
   */
  pageChange: EventEmitter<CustomEvent<number>>;
  /**
   * Event emitted when items per page changes
   */
  itemsPerPageChange: EventEmitter<CustomEvent<number>>;
}


@ProxyCmp({
  defineCustomElementFn: definePidPagination,
  inputs: ['currentPage', 'darkMode', 'itemsPerPage', 'pageSizes', 'showItemsPerPageControl', 'totalItems']
})
@Component({
  selector: 'pid-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['currentPage', 'darkMode', 'itemsPerPage', 'pageSizes', 'showItemsPerPageControl', 'totalItems'],
  outputs: ['pageChange', 'itemsPerPageChange'],
})
export class PidPagination {
  protected el: HTMLPidPaginationElement;
  @Output() pageChange = new EventEmitter<CustomEvent<number>>();
  @Output() itemsPerPageChange = new EventEmitter<CustomEvent<number>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PidPagination extends Components.PidPagination {
  /**
   * Event emitted when page changes
   */
  pageChange: EventEmitter<CustomEvent<number>>;
  /**
   * Event emitted when items per page changes
   */
  itemsPerPageChange: EventEmitter<CustomEvent<number>>;
}


@ProxyCmp({
  defineCustomElementFn: definePidTooltip,
  inputs: ['fitContent', 'maxHeight', 'maxWidth', 'position', 'text']
})
@Component({
  selector: 'pid-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['fitContent', 'maxHeight', 'maxWidth', 'position', { name: 'text', required: true }],
  outputs: ['tooltipExpansionChange'],
})
export class PidTooltip {
  protected el: HTMLPidTooltipElement;
  @Output() tooltipExpansionChange = new EventEmitter<CustomEvent<{ expand: boolean; requiredHeight: number }>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PidTooltip extends Components.PidTooltip {
  /**
   * Event emitted when tooltip requires row expansion
   */
  tooltipExpansionChange: EventEmitter<CustomEvent<{ expand: boolean; requiredHeight: number }>>;
}


