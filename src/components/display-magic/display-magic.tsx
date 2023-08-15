import {Component, Host, h, Prop, State, Watch} from '@stencil/core';
import {GenericIdentifierType} from "../../utils/GenericIdentifierType";
import {FoldableItem} from "../../utils/FoldableItem";
import {FoldableAction} from "../../utils/FoldableAction";
import {Parser} from "../../utils/Parser";

@Component({
  tag: 'display-magic',
  styleUrl: 'display-magic.css',
  shadow: true,
})
export class DisplayMagic {

  /**
   * The value to parse, evaluate and render.
   * @type {string}
   */
  @Prop() value: string;
  /**
   * A stringified JSON object containing settings for this component.
   * The resulting object is passed to every subcomponent, so that every component has the same settings.
   * Values and the according type are defined by the components themselves.
   * (optional)
   *
   * Schema:
   * ```typescript
   * {
   *  type: string,
   *  values: {
   *   name: string,
   *   value: any
   *  }[]
   * }[]
   * ```
   * @type {string}
   */
  @Prop() settings: string;

  /**
   * Determines whether the component is open or not by default.
   * Defaults to false.
   * (optional)
   * @type {boolean}
   */
  @Prop() openStatus: boolean = false;

  /**
   * Determines whether the colors of the table inside the component should change or not.
   * Defaults to true.
   * (optional)
   * @type {boolean}
   */
  @Prop() changingColors: boolean = true;

  /**
   * The amount of items to show in the table per page.
   * Defaults to 10.
   * (optional)
   * @type {number}
   */
  @Prop() amountOfItems: number = 10;

  /**
   * The total amount of levels of subcomponents to show.
   * Defaults to 1.
   * (optional)
   * @type {number}
   */
  @Prop() levelOfSubcomponents: number = 1;

  /**
   * The current level of subcomponents.
   * Defaults to 0.
   * (optional)
   * @type {number}
   */
  @Prop() currentLevelOfSubcomponents: number = 0;

  /**
   * Determines whether subcomponents should generally be shown or not.
   * If set to true but the total level of subcomponents is reached, subcomponents will not be shown.
   * Defaults to true.
   * (optional)
   */
  @Prop() showSubcomponents: boolean = true;

  /**
   * Stores the parsed identifier object.
   */
  @State() identifierObject: GenericIdentifierType;

  /**
   * Lists all the items to show in the table.
   */
  @State() items: FoldableItem[] = [];

  /**
   * Lists all the actions to show in the table.
   */
  @State() actions: FoldableAction[] = [];

  /**
   * Determines whether the subcomponents should be loaded or not.
   */
  @State() loadSubcomponents: boolean = false;

  /**
   * The current status of the component.
   * Can be "loading", "loaded" or "error".
   * Defaults to "loading".
   */
  @State() displayStatus: "loading" | "loaded" | "error" = "loading";

  /**
   * The current page of the table.
   */
  @State() tablePage: number = 0;

  /**
   * Watches the value property and calls connectedCallback() if it changes.
   * This is important for the different pages inside the table, since the magic-display components are not rerendered by default on value or state change.
   */
  @Watch("value")
  async watchValue() {
    this.displayStatus = "loading";
    await this.connectedCallback();
  }

  /**
   * Parses the value and settings, generates the items and actions and sets the displayStatus to "loaded".
   */
  async connectedCallback() {
    let settings: {
      type: string,
      values: {
        name: string,
        value: any
      }[]
    }[];

    try {
      settings = JSON.parse(this.settings);
    } catch (e) {
    }

    // Get an object from the best fitting class implementing GenericIdentifierType
    const obj = await Parser.getBestFit(this.value, settings);
    this.identifierObject = obj;

    // Generate items and actions if subcomponents should be shown
    if (this.showSubcomponents) {
      this.items = obj.items;
      this.items.sort((a, b) => {

        // Sort by priority defined in the specific implementation of GenericIdentifierType (lower is better)
        if (a.priority > b.priority) return 1;
        if (a.priority < b.priority) return -1;

        // Sort by priority defined by the index in the array of all data types in the parser (lower is better)
        if (a.estimatedTypePriority > b.estimatedTypePriority) return 1;
        if (a.estimatedTypePriority < b.estimatedTypePriority) return -1;
      });
      this.actions = obj.actions;
      this.actions.sort((a, b) => a.priority - b.priority);
    }
    this.displayStatus = "loaded";
  }

  /**
   * Toggles the loadSubcomponents property if the current level of subcomponents is not the total level of subcomponents.
   */
  private toggleSubcomponents = () => {
    if (this.showSubcomponents && (this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0)) this.loadSubcomponents = !this.loadSubcomponents;
  }

  /**
   * Shows the tooltip of the hovered element.
   * @param event The event that triggered this function.
   */
  private showTooltip = (event: Event) => {
    let target = event.target as HTMLElement;
    do {
      target = target.parentElement as HTMLElement;
    } while (target !== null && target.tagName !== "A")
    if (target !== null) target.children[1].classList.remove("hidden");
  }

  /**
   * Hides the tooltip of the hovered element.
   * @param event The event that triggered this function.
   */
  private hideTooltip = (event: Event) => {
    let target = event.target as HTMLElement;
    do {
      target = target.parentElement as HTMLElement;
    } while (target !== null && target.tagName !== "A")
    if (target !== null) target.children[1].classList.add("hidden");
  }

  /**
   * Renders the component.
   */
  render() {
    /**
     * Copies the given value to the clipboard and changes the text of the button to "✓ Copied!" for 1.5 seconds.
     * @param event The event that triggered this function.
     * @param value The value to copy to the clipboard.
     */
    function copyValue(event: MouseEvent, value: string) {
      navigator.clipboard.writeText(value)
      let el = event.target as HTMLButtonElement
      el.innerText = "✓ Copied!"
      el.classList.remove("hover:bg-blue-200")
      el.classList.remove("bg-white")
      el.classList.add("bg-green-200")
      setTimeout(() => {
        el.innerText = "Copy"
        el.classList.remove("bg-green-200")
        el.classList.add("hover:bg-blue-200")
        el.classList.add("bg-white")
      }, 1500)
    }

    return (
      <Host class="inline flex-grow max-w-full font-sans flex-wrap">
        {
          // Check if there are any items or actions to show
          this.items.length === 0 && this.actions.length === 0
            ? this.identifierObject !== undefined && this.displayStatus === "loaded"
              // If loaded but no items available render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
              ? this.identifierObject.renderPreview()
              : <span class={"inline-flex items-center transition ease-in-out"}>
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Loading... {this.value}
              </span>
            : <details
              class={"rounded-md shadow-md bg-white border text-clip inline flex-grow font-sans p-0.5 open:p-1 open:align-top open:w-full ease-in-out transition-all duration-200"}
              open={this.openStatus}
              onToggle={this.toggleSubcomponents}>
              <summary class="mx-2 select-none list-inside bg-white text-clip overflow-x-clip py-1 space-x-3">
                {
                  // Render the preview of the identifier object defined in the specific implementation of GenericIdentifierType
                  this.identifierObject.renderPreview()
                }
                {
                  // When this component is on the top level, show the copy button in the summary, in all the other cases show it in the table (implemented farther down)
                  this.currentLevelOfSubcomponents === 0 ?
                    <button
                      class={"bg-white border border-slate-500 text-slate-800 font-medium font-mono text-sm rounded-md px-2 py-0.5 hover:bg-blue-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-none max-h-min align-top mr-2"}
                      id={`copyButton-${this.identifierObject.value}`}
                      onClick={(event) => copyValue(event, this.identifierObject.value)}>Copy
                    </button>
                    : ""
                }
              </summary>
              {
                // If there are any items to show, render the table
                this.items.length > 0
                  ? <div>
                    <div
                      class="divide-y text-sm leading-6 bg-gray-100 m-1 p-0.5 max-h-72 overflow-y-scroll border rounded">
                      <table class="text-left w-full text-sm font-sans select-text">
                        <thead class="bg-slate-600 flex text-slate-200 w-full rounded-t">
                        <tr class="flex w-full rounded font-semibold">
                          <th class="px-1 w-1/4">Key</th>
                          <th class="px-1 w-3/4">Value</th>
                        </tr>
                        </thead>
                        <tbody
                          class="bg-grey-100 flex flex-col items-center justify-between overflow-y-scroll w-full max-h-64 rounded-b">
                        {
                          this.items.filter((_, index) => {
                            // Filter out items that are not on the current page
                            return index >= this.tablePage * this.amountOfItems && index < this.tablePage * this.amountOfItems + this.amountOfItems;
                          }).map((value) => {
                            // Render a row for every item
                            return (
                              <tr class={this.changingColors ? "odd:bg-slate-200 flex w-full" : "flex w-full"}>
                                <td class={"overflow-x-scroll p-1 w-1/4 font-mono"}>
                                  <a role="link"
                                     class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline flex-nowrap"
                                     onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                                     onMouseOut={this.hideTooltip}>
                                    <div class="cursor-pointer align-top justify-between flex-nowrap">
                                      <a href={value.keyLink}
                                         target={"_blank"}
                                         class={"mr-2 text-blue-400 justify-start float-left"}>
                                        {value.keyTitle}
                                      </a>
                                      <svg aria-haspopup="true" xmlns="http://www.w3.org/2000/svg"
                                           class="icon icon-tabler icon-tabler-info-circle justify-end min-w-[1rem] min-h-[1rem] flex-none float-right"
                                           width="25"
                                           height="25" viewBox="0 0 24 24"
                                           stroke-width="1.5" stroke="#A0AEC0" fill="none"
                                           stroke-linecap="round"
                                           stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z"/>
                                        <circle cx="12" cy="12" r="9"/>
                                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                                        <polyline points="11 12 12 12 12 16 13 16"/>
                                      </svg>
                                    </div>
                                    <p role="tooltip"
                                       class="hidden z-20 mt-1 transition duration-100 ease-in-out shadow-md bg-white rounded text-xs text-gray-600 p-1 flex-wrap overflow-clip"
                                    >{value.keyTooltip}</p>
                                  </a>
                                </td>
                                <td class={"align-top overflow-x-scroll text-sm p-1 w-3/4 select-text flex "}>
                                  <span class={"font-mono flex-grow"}>
                                  {
                                    // Load a foldable subcomponent if subcomponents are enabled (show subComponents) and the current level of subcomponents is not the total level of subcomponents. If the subcomponent is on the bottom level of the hierarchy render just a preview. If the value should not be resolved (isFoldable), just render the value as text.
                                    this.loadSubcomponents && this.showSubcomponents && !value.doNOTFold ?
                                      <display-magic value={value.value} changingColors={this.changingColors}
                                                     levelOfSubcomponents={this.levelOfSubcomponents}
                                                     currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                                                     amountOfItems={this.amountOfItems}
                                                     showSubcomponents={true} settings={this.settings}
                                      />
                                      : this.showSubcomponents && this.currentLevelOfSubcomponents === this.levelOfSubcomponents && !value.doNOTFold ?
                                        <display-magic value={value.value} changingColors={this.changingColors}
                                                       levelOfSubcomponents={this.currentLevelOfSubcomponents}
                                                       currentLevelOfSubcomponents={this.currentLevelOfSubcomponents}
                                                       amountOfItems={this.amountOfItems} showSubcomponents={false}
                                                       settings={this.settings}
                                        />
                                        : value.value
                                  }
                                  </span>
                                  <button
                                    class={"bg-white border border-slate-500 text-slate-800 font-medium font-mono text-sm rounded-md px-2 py-0.5 hover:bg-blue-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-none max-h-min align-top mx-2"}
                                    id={`copyButton-${value.value}`}
                                    onClick={(event) => copyValue(event, value.value)}>Copy
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        }
                        </tbody>
                      </table>
                    </div>
                    <div
                      class="flex items-center justify-between border-t border-gray-200 bg-white px-1 py-1 sm:px-1 max-h-12">
                      <div class="hidden sm:flex sm:flex-1 sm:flex-nowrap sm:items-center sm:justify-between text-sm">
                        <div class={""}>
                          <p class="text-sm text-gray-700">
                            Showing
                            <span class="font-medium"> {1 + this.tablePage * this.amountOfItems} </span>
                            to
                            <span
                              class="font-medium"> {Math.min(this.tablePage * this.amountOfItems + this.amountOfItems, this.items.length)} </span>
                            of
                            <span class="font-medium"> {this.items.length} </span>
                            entries
                          </p>
                        </div>
                        <div>
                          {this.items.length > this.amountOfItems ?
                            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                              <button onClick={() => {
                                this.tablePage = Math.max(this.tablePage - 1, 0)
                              }}
                                      class="relative inline-flex items-center rounded-l-md px-1 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <span class="sr-only">Previous</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fill-rule="evenodd"
                                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                        clip-rule="evenodd"/>
                                </svg>
                              </button>
                              {
                                Array(Math.ceil(this.items.length / this.amountOfItems)).fill(0).map((_, index) => {
                                  return (
                                    <button onClick={() => this.tablePage = index}
                                            class={index === this.tablePage ? "relative z-10 inline-flex items-center bg-indigo-600 px-2 py-1 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" : "relative hidden items-center px-2 py-1 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"}>{index + 1}
                                    </button>
                                  )
                                })
                              }
                              <button
                                onClick={() => {
                                  this.tablePage = Math.min(this.tablePage + 1, Math.floor(this.items.length / this.amountOfItems))
                                }}
                                class="relative inline-flex items-center rounded-r-md px-1 py-1 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                <span class="sr-only">Next</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fill-rule="evenodd"
                                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                        clip-rule="evenodd"/>
                                </svg>
                              </button>
                            </nav>
                            : ""
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  : ""
              }
              {this.identifierObject.renderBody()}
              {
                this.actions.length > 0 ?
                  <span class={"m-0.5 flex justify-between gap-1"}>
                {
                  this.actions.map((action) => {
                    let style = "p-1 font-semibold text-sm rounded border ";
                    switch (action.style) {
                      case "primary":
                        style += "bg-blue-500 text-white";
                        break;
                      case "secondary":
                        style += "bg-slate-200 text-blue-500";
                        break;
                      case "danger":
                        style += "bg-red-500 text-white";
                        break;
                    }

                    return (
                      <a
                        href={action.link}
                        class={style}
                        target={"_blank"}>
                        {action.title}
                      </a>
                    )
                  })
                }
              </span> : ""
              }
            </details>
        }
      </Host>
    )
  }
}
