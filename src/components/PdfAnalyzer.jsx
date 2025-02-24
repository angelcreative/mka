import { useState } from 'react';
import { MdUploadFile, MdChat } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import { analyzePdfs, chatWithAI } from '@/services/openai';
import ReactMarkdown from 'react-markdown';
import { ButtonSpinner } from './Loaders';
import AnalysisResults from './AnalysisResults';

function PdfAnalyzer() {
  const [files, setFiles] = useState({ pdf1: null, pdf2: null });
  const [brands, setBrands] = useState({ myBrand: '', competitor: '' });
  const [analysis, setAnalysis] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [fileErrors, setFileErrors] = useState({ pdf1: null, pdf2: null });

  const chatActions = {
    ATTACK_SEGMENT: 'attack_segment',
    COMPARE_SEGMENTS: 'compare_segments',
    GROWTH_STRATEGY: 'growth_strategy',
    AUDIENCE_INSIGHTS: 'audience_insights'
  };

  const handleFileChange = (event, fileKey) => {
    const file = event.target.files[0];
    const validTypes = {
      'application/pdf': true,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
      'application/vnd.ms-excel': true,
      'text/csv': true,
      'application/csv': true,
      'text/x-csv': true,
      'application/x-csv': true,
      'text/comma-separated-values': true,
      'text/x-comma-separated-values': true
    };

    const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv'];

    const fileExtension = file?.name.toLowerCase().match(/\.[^.]*$/)?.[0];

    if (file && (
      validTypes[file.type] || 
      (fileExtension && validExtensions.includes(fileExtension))
    )) {
      setFiles(prev => ({ ...prev, [fileKey]: file }));
      setFileErrors(prev => ({ ...prev, [fileKey]: null }));
    } else {
      setFileErrors(prev => ({ 
        ...prev, 
        [fileKey]: 'Please upload a valid PDF, Excel (.xlsx, .xls) or CSV file'
      }));
      event.target.value = null;
    }
  };

  const analyzePdfsHandler = async () => {
    if (!files.pdf1 || !files.pdf2 || !brands.myBrand || !brands.competitor) return;
    
    setLoading(true);
    try {
      const result = await analyzePdfs(files.pdf1, files.pdf2, brands.myBrand, brands.competitor);
      if (result && typeof result === 'string') {
        setAnalysis({ summary: result });
      } else {
        console.error('Invalid analysis result:', result);
        setAnalysis({ summary: '' });
      }
    } catch (error) {
      console.error('Error analyzing PDFs:', error);
      setAnalysis({ summary: '' });
    }
    setLoading(false);
  };

  const handleActionClick = async (action) => {
    setSelectedAction(action);
    switch (action) {
      case chatActions.ATTACK_SEGMENT:
        const segments = extractSegmentsFromAnalysis(analysis.summary);
        if (!segments || segments.length === 0) {
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: 'No se encontraron segmentos para analizar.'
          }]);
          return;
        }
        
        const segmentList = segments
          .map((seg, i) => `${i + 1}. ${seg.name} (${seg.size} usuarios)`)
          .join('\n');
        
        setChatMessages([{
          role: 'assistant',
          content: `# Selecciona un segmento para atacar:\n\n${segmentList}\n\nEscribe el número o nombre del segmento que quieres analizar.`
        }]);
        break;

      case chatActions.COMPARE_SEGMENTS:
        setChatMessages([{
          role: 'assistant',
          content: '# Comparación de Segmentos\nSelecciona dos segmentos para comparar:\n\n' +
                   '1. Escribe el primer segmento\n2. Luego escribe el segundo segmento'
        }]);
        break;

      // Añadir más casos según necesidad
    }
  };

  const handleUserMessage = async (message) => {
    if (!message.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setUserMessage('');
    setIsTyping(true);

    try {
      const response = await chatWithAI(message, analysis.summary);

      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un error al procesar tu solicitud.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const extractSegmentsFromAnalysis = (analysis) => {
    // Implementation of extractSegmentsFromAnalysis function
  };

  const handleSegmentSelection = (segments) => {
    // Implementation of handleSegmentSelection function
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="space-y-8">
        <div className="flex gap-6 justify-center">
          {/* My Brand Upload */}
          <div className="flex-1 max-w-md space-y-4">
            <input
              type="text"
              placeholder="Enter your brand name (e.g. Disney+)"
              value={brands.myBrand}
              onChange={(e) => setBrands(prev => ({ ...prev, myBrand: e.target.value }))}
              className="w-full p-2 border border-primary-100 rounded-lg"
            />
            <div className="border-2 border-dashed border-primary-100 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'pdf1')}
                className="hidden"
                id="pdf1"
              />
              <label htmlFor="pdf1" className="cursor-pointer block">
                <MdUploadFile className="mx-auto text-4xl text-primary-400 mb-2" />
                <span className="text-primary-600 font-semibold">Upload PDF Report</span>
                <p className="text-sm text-text-tertiary mt-1">Upload PDF report</p>
                {files.pdf1 && <p className="mt-2 text-sm text-[#1f1f1f]">{files.pdf1.name}</p>}
                {fileErrors.pdf1 && <p className="mt-2 text-sm text-red-500">{fileErrors.pdf1}</p>}
              </label>
            </div>
          </div>

          {/* Competitor Upload */}
          <div className="flex-1 max-w-md space-y-4">
            <input
              type="text"
              placeholder="Enter competitor brand name (e.g. Netflix)"
              value={brands.competitor}
              onChange={(e) => setBrands(prev => ({ ...prev, competitor: e.target.value }))}
              className="w-full p-2 border border-primary-100 rounded-lg text-text-primary placeholder-text-placeholder"
            />
            <div className="border-2 border-dashed border-primary-100 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'pdf2')}
                className="hidden"
                id="pdf2"
              />
              <label htmlFor="pdf2" className="cursor-pointer block">
                <MdUploadFile className="mx-auto text-4xl text-primary-400 mb-2" />
                <span className="text-primary-600 font-semibold">Upload PDF Report</span>
                <p className="text-sm text-text-tertiary mt-1">Upload PDF report</p>
                {files.pdf2 && <p className="mt-2 text-sm text-[#1f1f1f]">{files.pdf2.name}</p>}
                {fileErrors.pdf2 && <p className="mt-2 text-sm text-red-500">{fileErrors.pdf2}</p>}
              </label>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-purple-400">
          <p className="text-text-tertiary">Supported formats: PDF documents, Excel spreadsheets and CSV files (.pdf, .xlsx, .xls, .csv)</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={analyzePdfsHandler}
            disabled={!files.pdf1 || !files.pdf2 || !brands.myBrand || !brands.competitor || loading}
            className="bg-primary hover:bg-primary-hover active:bg-primary-pressed active:scale-95 
                     transform transition-all duration-150 text-white px-8 py-3 rounded-lg cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <ButtonSpinner />
                <span>Analyzing Reports...</span>
              </>
            ) : (
              <>
                <span>Analyze Market Position</span>
                <HiSparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Analysis Results & Chat Section */}
        {analysis && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            <AnalysisResults results={analysis} />
          </div>
        )}

        {/* Floating Ask AI Button */}
        {analysis && !showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 bg-[#1f1f1f] text-white px-4 py-3 rounded-full 
                     shadow-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
          >
            <MdChat className="w-5 h-5" />
            <span>Ask Boty</span>
          </button>
        )}

        {showChat && (
          <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-xl flex flex-col z-50">
            {/* Header */}
            <div className="bg-[#1f1f1f] text-white p-4 flex justify-between items-center">
              <h3 className="font-semibold">Market Intelligence Assistant</h3>
              <button 
                onClick={() => setShowChat(false)}
                className="hover:bg-gray-700 p-1 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-[#f7f7f7] overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-white text-gray-800 ml-auto shadow-sm' 
                      : 'bg-white text-gray-800 shadow-sm'
                  } rounded-xl p-4 prose`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ))}
              {isTyping && (
                <div className="flex">
                  <div className="bg-white rounded-xl p-3 flex items-center space-x-2 shadow-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isTyping}
                  className="w-full p-3 pr-10 bg-white border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-gray-50 text-gray-700 placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleUserMessage(userMessage)}
                />
                {!isTyping && userMessage.trim() && (
                  <button
                    onClick={() => handleUserMessage(userMessage)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 
                             text-gray-700 hover:text-blue-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfAnalyzer; 