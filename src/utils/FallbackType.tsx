import {FunctionalComponent, h} from "@stencil/core";
import {GenericIdentifierType} from "./GenericIdentifierType";

export class FallbackType extends GenericIdentifierType {
  hasCorrectFormat(): boolean {
    return true;
  }

  init(): Promise<void> {
    return Promise.resolve(undefined);
  }

  isResolvable(): boolean {
    return false;
  }

  renderBody(): FunctionalComponent<any> {
    return undefined;
  }

  renderPreview(): FunctionalComponent<any> {
    return (
      <span>{this.value}</span>
    )
  }

  getSettingsKey(): string {
    return "";
  }
}
