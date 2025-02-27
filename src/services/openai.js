import axios from 'axios';
import * as PDFJS from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { API_CONFIG } from '../config';

// Configurar el worker de PDF.js
PDFJS.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_CONFIG.baseUrl);
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);

const MODEL = 'gpt-4-0125-preview';

const openai = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    ...API_CONFIG.headers,
    'Authorization': 'Bearer ' + atob('c2stcHJvai1qSnNPWUhUOUVRampOdWF6cllFT19NUkpBTEJ6RzZ5MnNxQ1JTN1JwR0xkNGowYkRIRXJVZU5wSDFGd3Z2ekhzRnRPeTQ0RExLSFQzQmxia0ZKaVNRVkFfSFNOTF9ybkY0b1ZMWHRNcjBiNG13Tm1nTEFSXzRDMmVnTnV3Q3lJUnhmRmoxcHdWVmlOOUEyWXlPTVV2VlY1ZndGQUE=')
  },
});

const extractTextFromPdf = async (pdfData) => {
  try {
    const pdf = await PDFJS.getDocument({ data: pdfData }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

const getFileContent = async (file) => {
  let extractedData = '';
  
  if (file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    extractedData = await extractTextFromPdf(buffer);
  }

  validateExtractedData(extractedData);
  
  return extractedData;
};

const validateExtractedData = (data) => {
  if (!data || typeof data !== 'string' || data.length < 100) {
    throw new Error('Invalid or insufficient data extracted from file');
  }
};

export const analyzePdfs = async (pdf1, pdf2, brand1, brand2) => {
  try {
    const text1 = await getFileContent(pdf1);
    const text2 = await getFileContent(pdf2);
    
    console.log('Files processed successfully');
    
    const message = {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a market conquest strategist. Your task is to analyze two audience reports and provide a STRICTLY FORMATTED analysis following this exact structure:

          1. First section MUST be "Market Segment Analysis: ${brand1} vs ${brand2}"
          2. Second section MUST be "Similar Segments Across Both Platforms" with this exact table format:
             | ${brand1} Segment | Size | ${brand2} Segment | Size | Share % | Similarity Notes |
             Use actual numbers and emojis for segments.

          3. Third section MUST be "Unique ${brand1} Segments" with this exact table format:
             | Segment | Size | Market Share | Category Size | Penetration |
             Use actual numbers and emojis.

          4. Fourth section MUST be "Unique ${brand2} Segments" with same format as above.

          5. Following sections MUST be in this exact order:
             - Key Insights (with 7 numbered points)
             - Customer Loyalty Analysis (with bullet points)
             - Conversion Opportunities (with bullet points)
             - Targeted Strategies (with bullet points)
             - Differentiated Value Proposition (with bullet points)

          IMPORTANT RULES:
          - ALWAYS include actual numbers from the reports
          - ALWAYS use emojis for segment names
          - NEVER skip any section
          - ALWAYS maintain table formats exactly as shown
          - ALWAYS ensure data is properly formatted for charts`
        },
        {
          role: 'user',
          content: `Report 1 (${brand1}): ${text1}\n\nReport 2 (${brand2}): ${text2}`
        }
      ],
      temperature: 0.7
    };

    console.log('Making request to OpenAI...');
    const response = await openai.post('', message);
    console.log('Response received:', response.status);

    return response.data.choices[0].message.content || '';
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        headers: error.config?.headers
      }
    });
    return '';
  }
};

export const chatWithAI = async (message, context, brandName, competitorName) => {
  try {
    const response = await openai.post('', {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an audience insights expert analyzing ${brandName} and ${competitorName} segments.
          
          When responding, always structure your answers using proper markdown:
          
          - Use tables when comparing segments:
            | Segment | Metric | Notes |
            |---------|--------|-------|
            | Data    | Data   | Data  |
          
          - Use headers for sections:
            # Main points
            ## Sub-points
          
          - Use bullet points for lists
          - Include emojis when mentioning segments
          - Keep segment names exactly as they appear
          
          Focus your analysis on:
          1. Identifying similar audiences between platforms
          2. Understanding unique segment characteristics
          3. Suggesting ways ${brandName} can attract ${competitorName}'s audiences
          4. Explaining audience size and composition differences
          5. Highlighting opportunities for audience growth

          Remember that Audiense Insights cluster names are AI-generated and don't follow a fixed taxonomy.
          
          Context: ${context}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}; 