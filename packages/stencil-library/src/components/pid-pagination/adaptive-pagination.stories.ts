import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'pid-pagination/Adaptive',
  component: 'pid-pagination',
  argTypes: {
    adaptivePagination: {
      description: 'Enable adaptive pagination mode',
      control: 'boolean',
      defaultValue: true,
    },
    totalItems: {
      description: 'Total number of items',
      control: 'number',
    },
  },
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
    adaptivePagination: true,
  },
};
export default meta;
type Story = StoryObj;

// // Create mock data items for the stories
// const createMockItems = (count: number): FoldableItem[] => {
//   return Array.from({ length: count }, (_, i) => {
//     return new FoldableItem(
//       i, // priority
//       `Property ${i + 1}`, // keyTitle
//       `21.11100/0000-0003-4567-${i.toString().padStart(4, '0')}`, // value (valid PID format)
//       '', // keyTooltip
//       `https://hdl.handle.net/21.11100/0000-0003-4567-${i.toString().padStart(4, '0')}`, // keyLink
//       null, // regex to validate PID format
//       false, // renderDynamically
//     );
//   });
// };

export const Default: Story = {
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
    adaptivePagination: true,
  },
  render: args => html`
    <div style="width: 500px; border: 1px solid #ccc; padding: 10px;">
      <pid-pagination
        currentPage=${args.currentPage}
        totalItems=${args.totalItems}
        itemsPerPage=${args.itemsPerPage}
        adaptivePagination=${args.adaptivePagination}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-pagination>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-pagination
  currentPage="0"
  totalItems="100"
  itemsPerPage="10"
  adaptivePagination="true"
></pid-pagination>
        `,
      },
    },
  },
};

export const SmallContainer: Story = {
  args: {
    adaptivePagination: true,
    totalItems: 50,
  },
  render: args => html`
    <div style="width: 500px; height: 150px; border: 1px solid #cc0000; padding: 10px; background-color: #ffeeee;">
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 14px;">Small Container (Limited Height)</h3>
      <pid-pagination
        currentPage="0"
        totalItems=${args.totalItems}
        itemsPerPage="10"
        adaptivePagination=${args.adaptivePagination}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-pagination>
    </div>
  `,
};

export const LargeContainer: Story = {
  args: {
    adaptivePagination: true,
    totalItems: 150,
  },
  render: args => html`
    <div style="width: 800px; height: 300px; border: 1px solid #00cc00; padding: 10px; background-color: #eeffee;">
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 14px;">Large Container</h3>
      <pid-pagination
        currentPage="0"
        totalItems=${args.totalItems}
        itemsPerPage="10"
        adaptivePagination=${args.adaptivePagination}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-pagination>
    </div>
  `,
};
