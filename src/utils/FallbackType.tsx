import {FunctionalComponent, h} from "@stencil/core";
import {GenericIdentifierType} from "./GenericIdentifierType";

export class FallbackType extends GenericIdentifierType {
  hasCorrectFormat(): boolean {
    console.log("Fallback has correct format: " + this.value);
    return true;
  }

  init(): Promise<void> {
    console.log("Fallback init");
    return Promise.resolve(undefined);
  }

  isResolvable(): boolean {
    console.log("Fallback isn`t resolvable: " + this.value);
    return false;
  }

  renderBody(): FunctionalComponent<any> {
    return (
      <span>Body: {this.value} {this.settings}</span>
  )
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <span>Preview: {this.value} {this.settings}</span>
  )
  }

  getSettingsKey(): string {
    return "";
  }
}
