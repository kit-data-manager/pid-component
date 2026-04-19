import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DatasetCard from '../components/DatasetCard';
import { PidComponent } from '@kit-data-manager/react-pid-component';

const datasets = [
  {
    id: '1',
    title: 'KIT Data Metadata Analysis',
    doi: '10.5445/IR/1000185135',
    license: 'https://spdx.org/licenses/MIT',
    authorOrcid: '0009-0005-2800-4833',
    description: 'Comprehensive metadata analysis for KIT\'s research data repository.',
  },
  {
    id: '2',
    title: 'Research Output Repository Schema',
    doi: '10.5445/IR/1000178054',
    license: 'https://spdx.org/licenses/Apache-2.0',
    authorOrcid: '0009-0003-2196-9187',
    description: 'Schema definitions for research output management.',
  },
  {
    id: '3',
    title: 'FDO Implementation Guidelines',
    doi: '10.5445/IR/1000151234',
    license: 'https://spdx.org/licenses/CC-BY-4.0',
    authorOrcid: '0000-0001-6575-1022',
    description: 'Implementation guidelines for FAIR Digital Objects.',
  },
  {
    id: '4',
    title: 'Handle System Integration Study',
    doi: '10.5445/IR/1000123456',
    license: 'https://spdx.org/licenses/Apache-2.0',
    authorOrcid: '0009-0005-2800-4833',
    description: 'Integration patterns for Handle System in research workflows.',
  },
  {
    id: '5',
    title: 'PID Resolution Performance Benchmarks',
    doi: '10.5445/IR/1000111111',
    license: 'https://spdx.org/licenses/MIT',
    authorOrcid: '0009-0003-2196-9187',
    description: 'Performance benchmarks for various PID resolution strategies.',
  },
  {
    id: '6',
    title: 'FAIR Digital Object Registry',
    doi: '10.5445/IR/1000999999',
    license: 'https://spdx.org/licenses/CC-BY-4.0',
    authorOrcid: '0000-0001-6575-1022',
    description: 'Registry implementation for FAIR Digital Objects.',
  },
];

export default function DatasetsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Research Datasets</h1>
          <p style={{ fontSize: 16, color: '#6b7280' }}>
            Browse and explore the research datasets available in the ResearchNexus portal.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 16 }}>
            <div>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                display: 'block',
                marginBottom: 4,
              }}>Search</label>
              <input
                type="text"
                placeholder="Search datasets..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                display: 'block',
                marginBottom: 4,
              }}>License</label>
              <select style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: 'white',
                cursor: 'pointer',
              }}>
                <option>All Licenses</option>
                <option>Apache-2.0</option>
                <option>MIT</option>
                <option>CC-BY-4.0</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Sort
                By</label>
              <select style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: 'white',
                cursor: 'pointer',
              }}>
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Title A-Z</option>
                <option>Title Z-A</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Showing {datasets.length} datasets</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              fontSize: 13,
              cursor: 'pointer',
            }}>
              Grid View
            </button>
            <button style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              backgroundColor: '#f3f4f6',
              fontSize: 13,
              cursor: 'pointer',
            }}>
              List View
            </button>
          </div>
        </div>

        {/* Dataset Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} {...dataset} />
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            fontSize: 14,
            cursor: 'pointer',
          }}>
            Previous
          </button>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer',
          }}>
            1
          </button>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            fontSize: 14,
            cursor: 'pointer',
          }}>
            2
          </button>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            fontSize: 14,
            cursor: 'pointer',
          }}>
            3
          </button>
          <button style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            fontSize: 14,
            cursor: 'pointer',
          }}>
            Next
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
