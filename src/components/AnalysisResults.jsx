import React from 'react';
import { FiPrinter, FiCopy, FiBarChart2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalysisCard = ({ title, content, onPrint, onCopy, className = '' }) => {
  const [showChart, setShowChart] = React.useState(false);
  const chartRef = React.useRef(null);

  const parseTableData = (content) => {
    const rows = content.split('\n').filter(row => row.includes('|'));
    if (rows.length < 3) return null;

    // Extraer headers y datos, ignorando la fila de separación (|----|)
    const headers = rows[0].split('|')
      .filter(Boolean)
      .map(h => h.trim());
    
    const data = rows.slice(2).map(row => {
      const cells = row.split('|')
        .filter(Boolean)
        .map(cell => cell.trim());
      
      return {
        label: cells[0],
        values: cells.slice(1).map(val => {
          const number = parseFloat(val.replace(/[^0-9.-]/g, ''));
          return isNaN(number) ? 0 : number;
        })
      };
    });

    return { headers, data };
  };

  const renderChart = () => {
    const tableData = parseTableData(content);
    if (!tableData) return null;

    const { headers, data } = tableData;
    
    if (title.toLowerCase().includes('affinity') || title.toLowerCase().includes('overlap')) {
      return (
        <Bar
          data={{
            labels: data.map(row => row.label),
            datasets: headers.slice(1).map((header, i) => ({
              label: header,
              data: data.map(row => row.values[i]),
              backgroundColor: i === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)',
              borderColor: i === 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(99, 102, 241, 1)',
              borderWidth: 1
            }))
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: { 
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
                }
              },
              title: { display: true, text: title }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: value => `${value}%`
                }
              }
            }
          }}
          style={{ height: '300px' }}
        />
      );
    }

    return (
      <Doughnut
        data={{
          labels: data.map(row => row.label),
          datasets: [{
            data: data.map(row => row.values[0]),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',  // blue
              'rgba(99, 102, 241, 0.8)',  // indigo
              'rgba(139, 92, 246, 0.8)',  // violet
              'rgba(236, 72, 153, 0.8)',  // pink
              'rgba(248, 113, 113, 0.8)', // red
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.parsed}%`
              }
            },
            title: { display: true, text: title }
          }
        }}
        style={{ height: '300px' }}
      />
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          {parseTableData(content) && (
            <button
              onClick={() => setShowChart(!showChart)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Toggle Chart"
            >
              <FiBarChart2 className={`w-5 h-5 ${showChart ? 'text-[#1f1f1f]' : 'text-gray-600'}`} />
            </button>
          )}
          <button 
            onClick={onPrint}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Print"
          >
            <FiPrinter className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={onCopy}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy"
          >
            <FiCopy className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      {showChart && (
        <div className="mb-6">
          {renderChart()}
        </div>
      )}
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            table: props => (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" {...props} />
              </div>
            ),
            th: props => (
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
            ),
            td: props => (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" {...props} />
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

const AnalysisResults = ({ results }) => {
  if (!results || typeof results.summary !== 'string') {
    console.error('Invalid results:', results);
    return null;
  }

  const analysisText = results.summary;
  const sections = analysisText.split('###').filter(Boolean).map(section => {
    const [title, ...content] = section.trim().split('\n');
    return {
      title: title.trim().replace(/^#+\s*/, '').replace(/^[^\w\s]/, '') || 'Analysis Section',
      content: content.join('\n').trim() || 'No content available'
    };
  });

  const validSections = sections.filter(section => 
    section.content && 
    section.content !== 'No content available' && 
    !section.content.toLowerCase().includes('no content available')
  );

  // Agrupar las secciones por tipo
  const groupedSections = validSections.reduce((acc, section) => {
    const isFullWidth = section.title.toLowerCase().includes('overlap') || 
                        section.title.toLowerCase().includes('affinity');
    if (isFullWidth) {
      acc.fullWidth.push(section);
    } else {
      acc.regular.push(section);
    }
    return acc;
  }, { fullWidth: [], regular: [] });
  
  // Si hay un número impar de secciones regulares, la última ocupa todo el ancho
  if (groupedSections.regular.length % 2 !== 0) {
    const lastSection = groupedSections.regular.pop();
    groupedSections.fullWidth.push(lastSection);
  }

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <ReactMarkdown>{analysisText}</ReactMarkdown>
      </div>
    );
  }

  const handlePrint = (section) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${section.title}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="p-8">
          <h1 class="text-2xl font-bold mb-4">${section.title}</h1>
          <div class="prose">${section.content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopy = async (section) => {
    try {
      await navigator.clipboard.writeText(`${section.title}\n\n${section.content}`);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...groupedSections.fullWidth, ...groupedSections.regular].map((section, index) => (
        <AnalysisCard
          key={index}
          title={section.title}
          content={section.content}
          onPrint={() => handlePrint(section)}
          onCopy={() => handleCopy(section)}
          className={`${
            groupedSections.fullWidth.includes(section)
              ? 'md:col-span-2'
              : ''
          }`}
        />
      ))}
    </div>
  );
};

export default AnalysisResults; 