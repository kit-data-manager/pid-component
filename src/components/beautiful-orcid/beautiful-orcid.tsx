import {Component, Host, h, Prop} from '@stencil/core';

@Component({
  tag: 'beautiful-orcid',
  shadow: true,
  styleUrl: 'beautiful-orcid.css'
})
export class BeautifulOrcid {

  @Prop() orcid!: string;

  render() {
    return (
      <Host>
        <a href={`https://orcid.org/${this.orcid}`} class="font-mono">{this.orcid}</a>
      </Host>
    );
  }

}
