import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  title: 'json-viewer',
  component: 'json-viewer',
  argTypes: {
    data: { control: 'text' },
    viewMode: {
      control: { type: 'select' },
      options: ['tree', 'code'],
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
    },
    maxHeight: { control: { type: 'number' } },
    expandAll: { control: 'boolean' },
    showLineNumbers: { control: 'boolean' },
  },
  args: {
    data: JSON.stringify(
      {
        string: 'Hello World',
        number: 42,
        boolean: true,
        null: null,
        object: {
          a: 1,
          b: 2,
          c: 3,
        },
        array: [1, 2, 3, 4, 5],
        nested: {
          level1: {
            level2: {
              level3: {
                value: 'Deep nested value',
              },
            },
          },
        },
      },
      null,
      2,
    ),
    viewMode: 'tree',
    theme: 'light',
    maxHeight: 500,
    expandAll: false,
    showLineNumbers: true,
  },
};

export default meta;

type Story = StoryObj;

export const BasicUsage: Story = {
  render: args => html`
    <json-viewer
      data=${ifDefined(args.data)}
      view-mode=${ifDefined(args.viewMode)}
      theme=${ifDefined(args.theme)}
      max-height=${ifDefined(args.maxHeight)}
      ?expand-all=${args.expandAll}
      ?show-line-numbers=${args.showLineNumbers}
    ></json-viewer>
  `,
};

export const TreeView: Story = {
  args: {
    viewMode: 'tree',
  },
};

export const CodeView: Story = {
  args: {
    viewMode: 'code',
  },
};

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
  },
};

export const ExpandedAll: Story = {
  args: {
    expandAll: true,
  },
};

export const NoLineNumbers: Story = {
  args: {
    viewMode: 'code',
    showLineNumbers: false,
  },
};

export const ComplexData: Story = {
  args: {
    data: JSON.stringify(
      {
        id: '0001',
        type: 'donut',
        name: 'Cake',
        ppu: 0.55,
        batters: {
          batter: [
            { id: '1001', type: 'Regular' },
            { id: '1002', type: 'Chocolate' },
            { id: '1003', type: 'Blueberry' },
            { id: '1004', type: "Devil's Food" },
          ],
        },
        topping: [
          { id: '5001', type: 'None' },
          { id: '5002', type: 'Glazed' },
          { id: '5005', type: 'Sugar' },
          { id: '5007', type: 'Powdered Sugar' },
          { id: '5006', type: 'Chocolate with Sprinkles' },
          { id: '5003', type: 'Chocolate' },
          { id: '5004', type: 'Maple' },
        ],
        available: true,
        inStock: false,
      },
      null,
      2,
    ),
  },
};

export const Invalid: Story = {
  args: {
    data: '{"broken":true,}',
  },
  render: args => html`
    <json-viewer
      data=${ifDefined(args.data)}
      view-mode=${ifDefined(args.viewMode)}
      theme=${ifDefined(args.theme)}
    >
      <div style="padding: 1rem; text-align: center;">
        <p>Custom error content</p>
        <button onclick="this.closest('json-viewer').data='{\" fixed
        \":true}'">
        Fix JSON
        </button>
      </div>
    </json-viewer>
  `,
};
