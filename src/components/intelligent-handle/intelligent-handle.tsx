import {Component, h, State, Prop, Host} from '@stencil/core';
import {HSLColor} from "../../utils/HSLColor";
import {PID} from "../../utils/PID";
import {PIDRecord} from "../../utils/PIDRecord";
import {PIDDataType} from "../../utils/PIDDataType";

@Component({
  tag: 'intelligent-handle',
  styleUrl: 'intelligent-handle.css',
  shadow: true,
})
export class IntelligentHandle {
  /**
   The private state of the parts of the handle. Consists of the text, the color and a boolean whether a next part exists.
   */
  @State() parts: { text: string, color: HSLColor, nextExists: boolean }[] = [];

  /**
   * The private state where this component should link to.
   */
  @State() link: string = "";

  /**
   * The private state of the PID record.
   */
  @State() pidRecord: PIDRecord = undefined;

  /**
   * The private state of whether the subcomponents in the table should be loaded.
   */
  @State() loadSubcomponents: boolean = false;

  /**
   * The Handle to highlight and link in this component.
   */
  @Prop() handle!: string;

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


  /**
   * This method is called when the component is first connected to the DOM.
   * It generates the colors for the parts of the handle and stores them in the state.
   * Since the generation of the colors is asynchronous, the parts are added to the state as soon as they are generated.
   */
  async connectedCallback() {
    // Parse the PID
    const pid = PID.getPIDFromString(this.handle);

    // Generate the colors for the parts of the PID
    this.parts = [{
      text: pid.prefix,
      color: await HSLColor.generateColor(pid.prefix),
      nextExists: true
    }, {
      text: pid.suffix,
      color: await HSLColor.generateColor(pid.suffix),
      nextExists: false
    }]

    // Resolve the PID
    this.pidRecord = await pid.resolve();
    console.log(this.pidRecord)
    console.log("Finished loading...");
  }

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
      <Host class="inline-flex flex-grow w-fit max-w-screen-lg font-sans">
        <details
          class={"rounded-md shadow-md bg-white border text-clip align-baseline inline-flex flex-grow max-w-screen-lg font-sans p-0.5 open:p-1 open:align-top"}
          open={this.openStatus}
          onToggle={this.toggleSubcomponents}>
          <summary class="mx-2 select-none list-inside bg-white text-clip overflow-x-clip">
                            <span>
                                {
                                  this.parts.map((element) => {
                                    return (
                                      <span>
                                                <span
                                                  style={{
                                                    color: "hsl(" + element.color.hue + "," + element.color.sat + "%," + element.color.lum + "%)",
                                                  }}
                                                  class={`font-mono font-bold p-0.5 rounded-md`}>
                                                    {element.text}
                                                </span>
                                                <span class={"font-mono font-bold text-gray-800 mx-0.5"}>
                                                    {element.nextExists ? "/" : ""}
                                                </span>
                                            </span>
                                    )
                                  })
                                }
                            </span>
          </summary>
          <div
            class="divide-y text-sm leading-6 bg-gray-100 m-2 p-1 pt-0 max-h-64 overflow-y-scroll border rounded">
            <table
              class="table-auto text-left border-separate border-spacing-y-1.5 text-clip leading-relaxed overflow-x-scroll">
              <thead class={"z-10 bg-gray-100 sticky top-0 font-semibold"}>
              <tr>
                <th class={"border-b-2"}>Key</th>
                <th class={"border-b-2"}>Value</th>
              </tr>
              </thead>
              <tbody class={"font-normal font-mono"}>
              {
                (this.pidRecord !== undefined) ? this.pidRecord.values.filter((value) => {
                  return value.type instanceof PIDDataType
                }).map((value) => {
                  return (
                    <tr class={this.changingColors ? "odd:bg-slate-200" : ""}>
                      <td class={"overflow-x-scroll px-2 py-1"}>
                        <a role="link"
                           class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline"
                           onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                           onMouseOut={this.hideTooltip}>
                          <div class="cursor-pointer align-top flex flex-wrap">
                            <a href={(value.type as PIDDataType).redirectURL}
                               target={"_blank"}
                               class={"mr-2 text-blue-400"}>{(value.type as PIDDataType).name}</a>
                            <svg aria-haspopup="true" xmlns="http://www.w3.org/2000/svg"
                                 class="icon icon-tabler icon-tabler-info-circle" width="25"
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
                          <div role="tooltip"
                               class="hidden z-20 mt-1 transition duration-150 ease-in-out shadow-lg bg-white p-1 rounded-md">
                            <p class="text-xs text-gray-600 p-0.5">{(value.type as PIDDataType).description}</p>
                          </div>
                        </a>
                      </td>
                      <td class={"align-top text-clip text-sm overflow-x-scroll pl-2 p-1"}>
                        {
                          PID.isPID(value.data.value) ?
                            (this.loadSubcomponents ?
                              <intelligent-handle handle={value.data.value}
                                                  changingColors={this.changingColors}
                                                  levelOfSubcomponents={this.levelOfSubcomponents}
                                                  currentLevelOfSubcomponents={this.currentLevelOfSubcomponents + 1}
                              /> :
                              <handle-highlight handle={value.data.value.toString()}></handle-highlight>):
                              // <a
                              //   href={`https://kit-data-manager.github.io/fairdoscope/?pid=${value.data.value.toString()}`}
                              //   class={"underline"}
                              //   target={"_blank"}>{value.data.value.toString()}</a>) :
                            value.data.value
                        }
                      </td>
                    </tr>
                  )
                }) : ""
              }
              </tbody>
            </table>
          </div>
          {
            (this.pidRecord !== undefined) ?
              <span class={"m-2 flex justify-between"}>
                            <a
                              href={`https://kit-data-manager.github.io/fairdoscope/?pid=${this.pidRecord.pid.toString()}`}
                              class={"p-1.5 bg-slate-200 font-semibold text-blue-500 text-sm rounded border mr-1"}
                              target={"_blank"}>Open in FAIR-DOscope</a>
                            <a href={`https://hdl.handle.net/api/handles/${this.pidRecord.pid.toString()}`}
                               class={"p-1.5 bg-slate-200 font-semibold text-blue-500 text-sm rounded border ml-1"}
                               target={"_blank"}>Resolve via Handle.net</a>
                        </span>
              : ""
          }
        </details>
      </Host>
    );
  }
}
