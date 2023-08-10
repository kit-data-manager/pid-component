import {Component, Host, h, Prop, State} from '@stencil/core';
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

  @Prop() value: string;
  @Prop() settings: {
    type: string,
    values: {
      name: string,
      value: any
    }[]
  }[];
  @Prop() openStatus: boolean = false;
  @Prop() changingColors: boolean = true;
  @Prop() levelOfSubcomponents: number = 1;
  @Prop() currentLevelOfSubcomponents: number = 0;

  @State() identifierObject: GenericIdentifierType;
  @State() items: FoldableItem[] = [];
  @State() actions: FoldableAction[] = [];

  // @Watch("value") async valueChanged(newValue: string) {
  //   const obj = await Parser.getBestFit(newValue, this.settings);
  //   this.identifierObject = obj;
  //   this.items = obj.items;
  //   this.actions = obj.actions;
  // }

  async connectedCallback() {
    const obj = await Parser.getBestFit(this.value, this.settings);
    this.identifierObject = obj;
    this.items = obj.items;
    this.actions = obj.actions;
  }

  render() {
    return (
      <Host class="inline-flex flex-grow w-fit max-w-screen-lg font-sans">
        {this.items.length > 0 ?
          <foldable-component items={this.items} actions={this.actions} openStatus={this.openStatus}
                              changingColors={this.changingColors}
                              levelOfSubcomponents={this.levelOfSubcomponents}
                              currentLevelOfSubcomponents={this.currentLevelOfSubcomponents}>
            {this.identifierObject.renderPreview()}
          </foldable-component>
          : this.value
        }
      </Host>
    );
  }

}
