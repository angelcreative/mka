import { useState } from 'react';
import { MdUploadFile, MdChat } from 'react-icons/md';
import { analyzePdfs, chatWithAI } from '@/services/openai';
import ReactMarkdown from 'react-markdown';
import { ButtonSpinner } from './Loaders';

function PdfAnalyzer() {
  const [files, setFiles] = useState({ pdf1: null, pdf2: null });
  const [brands, setBrands] = useState({ myBrand: '', competitor: '' });
  const [analysis, setAnalysis] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleFileChange = (event, fileKey) => {
    const file = event.target.files[0];
    if (file && (
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'text/csv' ||
      file.name.endsWith('.csv')  // Para manejar CSVs que no tengan el tipo MIME correcto
    )) {
      setFiles(prev => ({ ...prev, [fileKey]: file }));
    }
  };

  const analyzePdfsHandler = async () => {
    if (!files.pdf1 || !files.pdf2 || !brands.myBrand || !brands.competitor) return;
    
    setLoading(true);
    try {
      const result = await analyzePdfs(files.pdf1, files.pdf2, brands.myBrand, brands.competitor);
      setAnalysis({ summary: result });
    } catch (error) {
      console.error('Error analyzing PDFs:', error);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newMessage]);
    setUserMessage('');
    setIsTyping(true);

    try {
      const response = await chatWithAI(userMessage, analysis.summary);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="space-y-8">
        <div className="flex gap-6 justify-center">
          {/* My Brand Upload */}
          <div className="flex-1 max-w-md space-y-4">
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={(e) => handleFileChange(e, 'pdf1')}
                className="hidden"
                id="pdf1"
              />
              <label htmlFor="pdf1" className="cursor-pointer block">
                <MdUploadFile className="mx-auto text-4xl text-purple-500 mb-2" />
                <span className="text-purple-600 font-semibold">My Brand Report</span>
                <p className="text-sm text-purple-400 mt-1">Upload PDF, Excel or CSV report</p>
                {files.pdf1 && <p className="mt-2 text-sm text-purple-500">{files.pdf1.name}</p>}
              </label>
            </div>
            <input
              type="text"
              placeholder="Enter your brand name (e.g. Disney+)"
              value={brands.myBrand}
              onChange={(e) => setBrands(prev => ({ ...prev, myBrand: e.target.value }))}
              className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Competitor Upload */}
          <div className="flex-1 max-w-md space-y-4">
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={(e) => handleFileChange(e, 'pdf2')}
                className="hidden"
                id="pdf2"
              />
              <label htmlFor="pdf2" className="cursor-pointer block">
                <MdUploadFile className="mx-auto text-4xl text-purple-500 mb-2" />
                <span className="text-purple-600 font-semibold">Your Competitor Report</span>
                <p className="text-sm text-purple-400 mt-1">Upload PDF, Excel or CSV report</p>
                {files.pdf2 && <p className="mt-2 text-sm text-purple-500">{files.pdf2.name}</p>}
              </label>
            </div>
            <input
              type="text"
              placeholder="Enter competitor brand name (e.g. Netflix)"
              value={brands.competitor}
              onChange={(e) => setBrands(prev => ({ ...prev, competitor: e.target.value }))}
              className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="text-center text-sm text-purple-400">
          <p>Supported formats: PDF documents, Excel spreadsheets and CSV files (.pdf, .xlsx, .xls, .csv)</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={analyzePdfsHandler}
            disabled={!files.pdf1 || !files.pdf2 || !brands.myBrand || !brands.competitor || loading}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                     transition-colors duration-200 disabled:bg-purple-300 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <ButtonSpinner />
                <span>Analyzing Reports...</span>
              </>
            ) : (
              <span>Analyze Market Position</span>
            )}
          </button>
        </div>

        {/* Analysis Results & Chat Section */}
        {analysis && (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Analysis Results</h3>
            <div 
              className="prose prose-purple max-w-none"
              dangerouslySetInnerHTML={{ __html: analysis.summary }}
            />
            <button
              onClick={() => setShowChat(true)}
              className="mt-4 flex items-center space-x-2 text-purple-600 mx-auto"
            >
              <MdChat />
              <span>Ask questions about the analysis</span>
            </button>
          </div>
        )}

        {showChat && (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto space-y-4">
            <div className="h-64 overflow-y-auto space-y-4 pr-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    message.role === 'user' 
                      ? 'bg-purple-100 ml-auto' 
                      : 'bg-purple-50'
                  } max-w-[80%] prose prose-purple`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ))}
              {isTyping && (
                <div className="flex">
                  <div className="bg-purple-50 rounded-xl p-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t border-purple-100">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isTyping}
                  className="w-full p-4 pr-12 bg-purple-50 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-purple-100 text-gray-700 placeholder-purple-400"
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
                />
                {!isTyping && userMessage.trim() && (
                  <button
                    onClick={sendMessage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:text-purple-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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