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

const AnalysisCard = ({ title, content, type, onPrint, onCopy, className = '' }) => {
  const [showChart, setShowChart] = React.useState(false);

  const parseTableData = React.useCallback((content) => {
    const rows = content.split('\n').filter(row => row.includes('|'));
    if (rows.length < 3) return null;

    // Validación más robusta de datos
    try {
      const hasValidData = rows.slice(2).some(row => {
        const cells = row.split('|').filter(Boolean);
        return cells.slice(1).some(cell => {
          const val = cell.trim();
          return !isNaN(parseFloat(val)) && val !== '-' && val !== 'N/A';
        });
      });

      if (!hasValidData) return null;

      const headers = rows[0].split('|')
        .filter(Boolean)
        .map(h => h.trim());
      
      const data = rows.slice(2).map(row => {
        const cells = row.split('|')
          .filter(Boolean)
          .map(cell => cell.trim());
        
        if (cells.length < 2) return null; // Prevenir filas inválidas
        
        return {
          label: cells[0],
          values: cells.slice(1).map(val => {
            if (val === 'N/A' || val === '-') return 0;
            const number = parseFloat(val.replace(/[^0-9.-]/g, ''));
            return isNaN(number) ? 0 : number;
          })
        };
      }).filter(Boolean); // Filtrar filas nulas

      if (data.length === 0) return null;

      return { headers, data };
    } catch (error) {
      console.error('Error parsing table data:', error);
      return null;
    }
  }, []);

  const renderChart = React.useCallback(() => {
    const tableData = parseTableData(content);
    if (!tableData) return null;

    const { headers, data } = tableData;
    
    if (!headers || headers.length < 2 || !data || data.length === 0) {
      return null;
    }

    // Crear un mapa de colores consistente para cada tipo de dato
    const colorMap = {
      'Size': 'rgba(59, 130, 246, 0.8)',    // Azul
      'Share %': 'rgba(139, 92, 246, 0.8)', // Morado
      'Market Share': 'rgba(16, 185, 129, 0.8)', // Verde
      'Category Size': 'rgba(245, 158, 11, 0.8)', // Naranja
      'Penetration': 'rgba(239, 68, 68, 0.8)'    // Rojo
    };

    return (
      <Bar
        data={{
          labels: data.map(row => row.label),
          datasets: headers.slice(1).map((header, i) => ({
            label: header,
            data: data.map(row => row.values[i]),
            backgroundColor: colorMap[header] || `hsl(${i * 50}, 70%, 60%)`,
            borderColor: '#ffffff',
            borderWidth: 1
          }))
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y;
                  const label = context.dataset.label;
                  return `${label}: ${value}${label.includes('%') ? '%' : ''}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value + (this.chart.data.datasets[0].label.includes('%') ? '%' : '');
                }
              }
            }
          }
        }}
      />
    );
  }, [content, parseTableData]);

  const renderContent = React.useCallback(() => {
    if (!content) return null;
    
    return (
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            table: props => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-200 border" {...props} />
              </div>
            ),
            th: props => (
              <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" {...props} />
            ),
            td: props => (
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-b" {...props} />
            ),
            ul: props => (
              <ul className="list-disc pl-4 space-y-2" {...props} />
            ),
            ol: props => (
              <ol className="list-decimal pl-4 space-y-2" {...props} />
            ),
            p: props => (
              <p className="my-2 text-gray-700" {...props} />
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }, [content]);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 break-words max-w-[80%]">
          {title || 'Untitled Section'}
        </h3>
        <div className="flex gap-2">
          {content && parseTableData(content) && (
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
        <div className="mb-6 h-[300px]">
          {renderChart()}
        </div>
      )}
      {renderContent()}
    </div>
  );
};

const AnalysisResults = ({ results }) => {
  const determineContentType = (content) => {
    if (content.includes('|---')) return 'table';
    if (content.match(/^\d+\./m)) return 'numbered-list';
    if (content.match(/^[-*]/m)) return 'bullet-list';
    return 'text';
  };

  if (!results || typeof results.summary !== 'string') {
    console.error('Invalid results:', results);
    return null;
  }

  const analysisText = results.summary;
  const sections = analysisText.split(/(?=# [A-Z])/).filter(Boolean).map(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    // El título principal no debe ser una sección independiente
    if (title.startsWith('Market Segment Analysis:')) {
      return null;
    }

    // Validar que la sección sea una de las requeridas
    const requiredSections = [
      'Market Segment Analysis',
      'Similar Segments Across Both Platforms',
      'Unique',
      'Key Insights',
      'Customer Loyalty Analysis',
      'Conversion Opportunities',
      'Targeted Strategies',
      'Differentiated Value Proposition'
    ];
    
    if (!requiredSections.some(req => title.includes(req))) {
      console.warn(`Unexpected section: ${title}`);
    }

    return {
      title,
      content,
      type: determineContentType(content)
    };
  }).filter(Boolean); // Filtrar las secciones nulas

  const validSections = sections.filter(section => 
    section.content && 
    section.content !== 'No content available' &&
    section.title && 
    section.title.length > 0
  );

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
    <div className="space-y-6">
      {/* Título principal fuera de las cards */}
      <h1 className="text-2xl font-bold text-gray-900">
        {results.summary.split('\n')[0].replace(/^#+\s*/, '')}
      </h1>
      
      {/* Grid de secciones */}
      <div className="grid grid-cols-1 gap-6">
        {validSections.map((section, index) => (
          <AnalysisCard
            key={index}
            title={section.title}
            content={section.content}
            type={section.type}
            onPrint={() => handlePrint(section)}
            onCopy={() => handleCopy(section)}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalysisResults; 