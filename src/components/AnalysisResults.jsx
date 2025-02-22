import React from 'react';
import { FiPrinter, FiCopy } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AnalysisCard = ({ title, content, onPrint, onCopy }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
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
      {sections.map((section, index) => (
        <AnalysisCard
          key={index}
          title={section.title}
          content={section.content}
          onPrint={() => handlePrint(section)}
          onCopy={() => handleCopy(section)}
        />
      ))}
    </div>
  );
};

export default AnalysisResults; 