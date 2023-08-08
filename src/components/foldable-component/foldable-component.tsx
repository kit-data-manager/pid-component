import {Component, Host, h, State, Prop} from '@stencil/core';

export type FoldableItem = {
  keyTitle: string,
  keyTooltip: string,
  keyLink?: string,
  value: string,
  valueRegex?: RegExp
}

export type FoldableAction = {
  title: string,
  link: string,
  style: "primary" | "secondary" | "danger"
}

@Component({
  tag: 'foldable-component',
  styleUrl: 'foldable-component.css',
  shadow: true,
})
export class FoldableComponent {

  @Prop() items: FoldableItem[] = [
    // {
    //   keyTitle: "Title",
    //   keyTooltip: "The title of the dataset.",
    //   keyLink: "https://schema.org/name",
    //   value: "KIT Data Manager",
    //   valueRegex: /KIT Data Manager/
    // },
    // {
    //   keyTitle: "Description",
    //   keyTooltip: "The description of the dataset.",
    //   keyLink: "https://schema.org/description",
    //   value: "The KIT Data Manager is a software for managing research data.",
    //   valueRegex: /The KIT Data Manager is a software for managing research data./
    // },
    // {
    //   keyTitle: "Identifier",
    //   keyTooltip: "The identifier of the dataset.",
    //   keyLink: "https://schema.org/identifier",
    //   value: "https://doi.org/10.5445/IR/1000123456",
    //   valueRegex: /https:\/\/doi.org\/10.5445\/IR\/1000123456/
    // },
    // {
    //   keyTitle: "Publisher",
    //   keyTooltip: "The publisher of the dataset.",
    //   keyLink: "https://schema.org/publisher",
    //   value: "Karlsruhe Institute of Technology (KIT)",
    //   valueRegex: /Karlsruhe Institute of Technology \(KIT\)/
    // },
    // {
    //   keyTitle: "Creator",
    //   keyTooltip: "The creator of the dataset.",
    //   keyLink: "https://schema.org/creator",
    //   value: "Karlsruhe Institute of Technology (KIT)",
    //   valueRegex: /Karlsruhe Institute of Technology \(KIT\)/
    // },
    // {
    //   keyTitle: "Contributor",
    //   keyTooltip: "The contributor of the dataset.",
    //   keyLink: "https://schema.org/contributor",
    //   value: "Karlsruhe Institute of Technology (KIT)",
    //   valueRegex: /Karlsruhe Institute of Technology \(KIT\)/
    // },
    // {
    //   keyTitle: "Date Published",
    //   keyTooltip: "The date the dataset was published.",
    //   keyLink: "https://schema.org/datePublished",
    //   value: "2021-01-01",
    //   valueRegex: /2021-01-01/
    // },
    // {
    //   keyTitle: "Date Modified",
    //   keyTooltip: "The date the dataset was modified.",
    //   keyLink: "https://schema.org/dateModified",
    //   value: "2021-01-01",
    //   valueRegex: /2021-01-01/
    // },
    // {
    //   keyTitle: "License",
    //   keyTooltip: "The license of the dataset.",
    //   keyLink: "https://schema.org/license",
    //   value: "https://creativecommons.org/licenses/by/4.0/",
    //   valueRegex: /https:\/\/creativecommons.org\/licenses\/by\/4.0\//
    // }
  ]

  @Prop() actions: FoldableAction[] = [
    // {
    //   title: "View on FAIR Data Point",
    //   link: "https://kit-fairdatapoint.esc.rzg.mpg.de/fdp/dataset/kitdm/",
    //   style: "primary"
    // },
    // {
    //   title: "View on FAIR Data Point",
    //   link: "https://kit-fairdatapoint.esc.rzg.mpg.de/fdp/dataset/kitdm/",
    //   style: "secondary"
    // },
    // {
    //   title: "View on FAIR Data Point",
    //   link: "https://kit-fairdatapoint.esc.rzg.mpg.de/fdp/dataset/kitdm/",
    //   style: "danger"
    // }
  ]

  /**
   * The private state of whether the subcomponents in the table should be loaded.
   */
  @State() loadSubcomponents: boolean = false;

  /**
   * Should the table inside the component change colors every other line?
   */
  @Prop() changingColors: boolean = true;

  /**
   * Should the details element be open by default?
   */
  @Prop() openStatus: boolean = false;

  /**
   * The current elevation level of the subcomponents.
   * If the difference between the current level and the level of the subcomponents is 0, the subcomponents are not shown.
   */
  @Prop() currentLevelOfSubcomponents: number = 0;

  /**
   * The maximum level of subcomponents to show.
   */
  @Prop() levelOfSubcomponents: number = 1;

  /**
   * Should the subcomponents be shown?
   */
  @Prop() showSubcomponents: boolean = true;

  private toggleSubcomponents = () => {
    if (this.showSubcomponents && this.levelOfSubcomponents - this.currentLevelOfSubcomponents > 0) this.loadSubcomponents = !this.loadSubcomponents;
  }

  private showTooltip = (event: Event) => {
    let target = event.target as HTMLElement;
    do {
      target = target.parentElement as HTMLElement;
    } while (target !== null && target.tagName !== "A")
    if (target !== null) target.children[1].classList.remove("hidden");
  }

  private hideTooltip = (event: Event) => {
    let target = event.target as HTMLElement;
    do {
      target = target.parentElement as HTMLElement;
    } while (target !== null && target.tagName !== "A")
    if (target !== null) target.children[1].classList.add("hidden");
  }

  render() {
    return (
      <Host class="inline-flex flex-grow max-w-screen-lg font-sans flex-wrap">
        {
          this.items.length === 0 && this.actions.length === 0
            ? <div class="rounded-md shadow-md border inline-flex flex-grow max-w-screen-lg font-sans p-0.5 mx-2 select-none list-inside bg-white text-clip overflow-x-clip">
              {/*<handle-highlight handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343"></handle-highlight>*/}
              <slot/>
            </div>
            :
            <details
              class={"rounded-md shadow-md bg-white border text-clip inline-flex flex-grow max-w-screen-lg font-sans p-0.5 open:p-1 open:align-top"}
              open={this.openStatus}
              onToggle={this.toggleSubcomponents}>
              <summary class="mx-2 select-none list-inside bg-white text-clip overflow-x-clip mb-1">
                {/*<handle-highlight handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343"></handle-highlight>*/}
                <slot />
              </summary>
              {
                this.items.length > 0
                  ? <div
                    class="divide-y text-sm leading-6 bg-gray-100 m-1 p-0.5 max-h-64 overflow-y-scroll border rounded">
                    <table class="text-left w-full text-sm font-sans">
                      <thead class="bg-slate-600 flex text-slate-200 w-full rounded-t">
                      <tr class="flex w-full rounded font-semibold">
                        <th class="px-1 w-1/4">Key</th>
                        <th class="px-1 w-3/4">Value</th>
                      </tr>
                      </thead>
                      <tbody
                        class="bg-grey-100 flex flex-col items-center justify-between overflow-y-scroll w-full max-h-48 rounded-b">
                      {
                        this.items.map((value) => {
                          return (
                            <tr class={this.changingColors ? "odd:bg-slate-200 flex w-full" : "flex w-full"}>
                              <td class={"overflow-x-scroll p-1 w-1/4 font-mono"}>
                                <a role="link"
                                   class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline flex-wrap"
                                   onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                                   onMouseOut={this.hideTooltip}>
                                  <div class="cursor-pointer align-top justify-between flex">
                                    <a href={value.keyLink}
                                       target={"_blank"}
                                       class={"mr-2 text-blue-400 justify-start"}>{value.keyTitle}</a>
                                    <svg aria-haspopup="true" xmlns="http://www.w3.org/2000/svg"
                                         class="icon icon-tabler icon-tabler-info-circle justify-end" width="25"
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
                              <td class={"align-top text-clip text-sm overflow-x-scroll p-1 w-3/4"}>
                                {value.value}
                              </td>
                            </tr>
                          )
                        })
                      }

                      </tbody>
                    </table>
                  </div>
                  : ""
              }
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
    );
  }
}
