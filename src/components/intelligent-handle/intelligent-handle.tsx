import {Component, h, State, Prop, Host} from '@stencil/core';
import {HSLColor} from "../../utils/HSLColor";
import {PID} from "../../utils/PID";
import {PIDRecord} from "../../utils/PIDRecord";
import {FoldableAction, FoldableItem} from "../foldable-component/foldable-component";
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

    @State() items: FoldableItem[] = [];
    @State() actions: FoldableAction[] = [];

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
    @Prop() levelOfSubcomponents: number = 3;

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
        const resolved = await pid.resolve();
        this.pidRecord = resolved;
        for (const value of resolved.values) {
            if (value.type instanceof PIDDataType) {
                this.items.push({
                    keyTitle: value.type.name,
                    keyTooltip: value.type.description,
                    keyLink: value.type.redirectURL,
                    value: value.data.value
                })
            }
        }

        this.actions.push({
            title: "Open in FAIR-DOscope",
            link: `https://kit-data-manager.github.io/fairdoscope/?pid=${resolved.pid.toString()}`,
            style: "primary"
        })

        console.log(this.pidRecord)
        console.log(this.items)
        console.log(this.actions)
        console.log("Finished loading...");
    }

    render() {
        return (
            <Host class="inline-flex flex-grow w-fit max-w-screen-lg font-sans">
                {this.items.length > 0 ?
                    <foldable-component items={this.items} actions={this.actions} openStatus={this.openStatus}
                                        changingColors={this.changingColors}
                                        levelOfSubcomponents={this.levelOfSubcomponents}
                                        currentLevelOfSubcomponents={this.currentLevelOfSubcomponents}>
                        <span>
                                {this.parts.map((element) => {
                                    return (
                                        <span>
                                            <span
                                                style={{
                                                    color: "hsl(" + element.color.hue + "," + element.color.sat + "%," + element.color.lum + "%)",
                                                }}
                                                class={`font-mono font-bold rounded-md`}>
                                              {element.text}
                                            </span>
                                            <span class={"font-mono font-bold text-gray-800 mx-0.5"}>
                                              {element.nextExists ? "/" : ""}
                                            </span>
                                      </span>
                                    )
                                })}
                            </span>
                    </foldable-component>
                    : <handle-highlight handle={this.handle.toString()}></handle-highlight>
                }
            </Host>
        );
    }
}
