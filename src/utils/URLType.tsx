import {GenericIdentifierType} from "./GenericIdentifierType";
import {FunctionalComponent, h} from "@stencil/core";

export class URLType extends GenericIdentifierType {

    getSettingsKey(): string {
        return "DateType";
    }

    hasCorrectFormat(): boolean {
        const regex = new RegExp('^http(s)?:(\/\/([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$')
        return regex.test(this.value)
    }

    init(): Promise<void> {
        return
    }

    isResolvable(): boolean {
        return false;
    }

    renderPreview(): FunctionalComponent<any> {
        return (
            <a href={this.value} target="_blank" class={"font-mono text-sm text-blue-400"}>{this.value}</a>
        )
    }

}
