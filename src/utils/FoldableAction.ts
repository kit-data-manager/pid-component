export class FoldableAction {
    private readonly _priority: number;
    private readonly _title: string;
    private readonly _link: string;
    private readonly _style: "primary" | "secondary" | "danger";

    constructor(priority: number, title: string, link: string, style: "primary" | "secondary" | "danger") {
        this._priority = priority;
        this._title = title;
        this._link = link;
        this._style = style;
    }

    get priority(): number {
        return this._priority;
    }

    get title(): string {
        return this._title;
    }

    get link(): string {
        return this._link;
    }

    get style(): "primary" | "secondary" | "danger" {
        return this._style;
    }
}
