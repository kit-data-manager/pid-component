import {Component, h, State, Prop, Host} from '@stencil/core';
// import {loadDisplayData} from "../../utils/utils";
// import {handleMap, PID, HSLColor} from "../../utils/PIDResolver";
import {generateColor, HSLColor} from "../../utils/utils";

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
     * This method is called when the component is first connected to the DOM.
     * It generates the colors for the parts of the handle and stores them in the state.
     * Since the generation of the colors is asynchronous, the parts are added to the state as soon as they are generated.
     */
    async connectedCallback() {
        // loadDisplayData(this.handle).then(() => {
        //   console.log("Finished loading display data")
        // });

        const handleParts = this.handle.split("/");
        for (let i = 0; i < handleParts.length; i++) {
            const color = generateColor(handleParts[i])
            color.then((color) => {
                const newVal = {
                    text: handleParts[i],
                    color: color,
                    nextExists: !(i == handleParts.length - 1)
                }
                this.parts = [...this.parts, newVal]
            })
        }
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
            <Host class="inline-flex flex-grow max-w-screen-md">
                <details
                    class={"rounded-md shadow-md bg-white border text-clip align-baseline"} open={this.openStatus}>
                    <summary class="mx-2 select-none list-inside bg-white text-clip overflow-x-scroll ">
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
                        class="divide-y text-sm leading-6 bg-gray-100 m-2 p-1 pt-0 h-48 overflow-y-scroll border rounded-md shadow-md">
                        <table
                            class="table-fixed text-left border-separate border-spacing-y-1.5 text-clip leading-relaxed overflow-x-scroll">
                            <thead class={"z-10 bg-gray-100 sticky top-0 font-semibold"}>
                            <tr>
                                <th class={"border-b-2"}>Key</th>
                                <th class={"border-b-2"}>Value</th>
                            </tr>
                            </thead>
                            <tbody class={"font-normal font-mono"}>
                            <tr class={this.changingColors ? "odd:bg-slate-200 odd:rounded-md" : ""}>
                                <td class={"overflow-x-scroll px-2 py-1"}>
                                    <a role="link"
                                       class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline"
                                       onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                                       onMouseOut={this.hideTooltip}>
                                        <div class="cursor-pointer align-top flex flex-wrap">
                                            <a href={"https://hdl.handle.net/21.T11148/076759916209e5d62bd5?locatt=view:ui"}
                                               target={"_blank"}
                                               class={"mr-2 text-blue-400"}>kernelInformationProfile</a>
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
                                            <p class="text-xs text-gray-600 p-0.5">
                                                This could be your description of this key/type.
                                            </p>
                                        </div>
                                    </a>
                                </td>
                                <td class={"align-top text-clip overflow-x-scroll pl-2"}><a
                                    href={""}>21.T11148/4c5190a0a30c4a0321ea</a></td>
                            </tr>
                            <tr class={this.changingColors ? "odd:bg-slate-200 odd:rounded-md" : ""}>
                                <td class={"overflow-x-scroll px-2 py-1"}>
                                    <a role="link"
                                       class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline"
                                       onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                                       onMouseOut={this.hideTooltip}>
                                        <div class="cursor-pointer align-top flex flex-wrap">
                                            <a href={"https://hdl.handle.net/21.T11148/076759916209e5d62bd5?locatt=view:ui"}
                                               target={"_blank"} class={"mr-2 text-blue-400"}>This is a really long type
                                                name or id and it has a very long description and a long value</a>
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
                                            <p class="text-xs text-gray-600 p-0.5">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                                                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                                                commodo consequat.
                                            </p>
                                        </div>
                                    </a>
                                </td>
                                <td class={"align-middle text-clip overflow-x-scroll pl-2"}><a
                                    href={""}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                    tempor incididunt ut labore et dolore magna aliqua. </a></td>
                            </tr>
                            <tr class={this.changingColors ? "odd:bg-slate-200 odd:rounded-md" : ""}>
                                <td class={"overflow-x-scroll px-2 py-1"}>
                                    <a role="link"
                                       class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline"
                                       onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                                       onMouseOut={this.hideTooltip}>
                                        <div class="cursor-pointer align-top flex flex-wrap">
                                            <a href={"https://hdl.handle.net/21.T11148/076759916209e5d62bd5?locatt=view:ui"}
                                               target={"_blank"}
                                               class={"mr-2 text-blue-400"}>dateCreated</a>
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
                                            <p class="text-xs text-gray-600 p-0.5">
                                                The date the object was created.
                                            </p>
                                        </div>
                                    </a>
                                </td>
                                <td class={"align-top text-clip overflow-x-scroll pl-2"}>{new Date(Date.parse("2022-11-11T08:01:20.557+00:00")).toLocaleString()}</td>
                            </tr>
                            <tr class={this.changingColors ? "odd:bg-slate-200 odd:rounded-md" : ""}>
                                <td class={"overflow-x-scroll px-2 py-1"}>
                                    <a role="link"
                                       class="right-0 focus:outline-none focus:ring-gray-300 rounded-md focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 relative md:mt-0 inline"
                                       onMouseOver={this.showTooltip} onFocus={this.showTooltip}
                                       onMouseOut={this.hideTooltip}>
                                        <div class="cursor-pointer align-top flex flex-wrap">
                                            <a href={"https://hdl.handle.net/21.T11148/076759916209e5d62bd5?locatt=view:ui"}
                                               target={"_blank"}
                                               class={"mr-2 text-blue-400"}>dateModified</a>
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
                                            <p class="text-xs text-gray-600 p-0.5">
                                                The date the object was modified.
                                            </p>
                                        </div>
                                    </a>
                                </td>
                                <td class={"align-top text-clip overflow-x-scroll pl-2"}>{new Date(Date.now()).toLocaleString("de", {
                                    year: "numeric",
                                    month: "long",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZoneName: "short"
                                })}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <span class={"m-2 flex justify-between"}>
                            <button class={"px-2 bg-slate-200 text-blue-500 underline rounded shadow-md border mr-1"}>Open in FAIR-DOscope</button>
                            <button class={"px-2 bg-slate-200 text-blue-500 underline rounded shadow-md border ml-1"}>Resolve via Handle.net</button>
                        </span>
                </details>
            </Host>
        );
    }
}
