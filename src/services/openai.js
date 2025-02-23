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

const extractTextFromExcel = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    let fullText = '';

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetText = XLSX.utils.sheet_to_txt(worksheet);
      fullText += `Sheet ${sheetName}:\n${sheetText}\n\n`;
    });

    return fullText;
  } catch (error) {
    console.error('Error extracting text from Excel:', error);
    throw error;
  }
};

const extractTextFromCsv = async (file) => {
  try {
    const text = await file.text();
    // Convertir CSV a una tabla más legible
    const workbook = XLSX.read(text, { type: 'string' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_txt(worksheet);
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    throw error;
  }
};

const getFileContent = async (file) => {
  if (file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    return extractTextFromPdf(buffer);
  } else if (
    file.type.includes('spreadsheet') || 
    file.type.includes('excel') ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls')
  ) {
    return extractTextFromExcel(file);
  } else if (
    file.type === 'text/csv' ||
    file.name.endsWith('.csv')
  ) {
    return extractTextFromCsv(file);
  }
  throw new Error('Unsupported file type');
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
          content: `You are a market conquest strategist analyzing ${brand1} and ${brand2} audience data.
          
          # Market Segment Analysis: ${brand1} vs ${brand2}
          
          # Similar Segments Across Both Platforms
          | ${brand1} Segment | Size | ${brand2} Segment | Size | Share % | Similarity Notes |
          |------------------|------|------------------|------|----------|------------------|
          Note: All sizes must be actual numbers (e.g., Marvel & Movies 🎬 | 19,376 | Marvel & DC 🎬 | 25,328 | 76.5% | Both superhero fans)
          
          # Unique ${brand1} Segments
          | Segment | Size | Market Share | Category Size | Penetration |
          |---------|------|--------------|---------------|-------------|
          Note: All metrics must be actual numbers (e.g., Tech Enthusiasts 💻 | 12,972 | 15.3% | 84,750 | High)
          
          # Unique ${brand2} Segments
          | Segment | Size | Market Share | Category Size | Penetration |
          |---------|------|--------------|---------------|-------------|
          Note: All metrics must be actual numbers
          
          # Key Insights
          1. Primary Platform Comparison
          2. Content Focus Comparison
          3. Audience Composition
          4. International Presence
          5. Brand Positioning
          6. Growth Opportunities
          7. Unique Value Propositions
          
          # Customer Loyalty Analysis
          - Deep dive into emotional and practical factors driving customer loyalty
          - Identify specific customer segments and their key loyalty drivers
          - Analyze price sensitivity, brand perception, and switching barriers
          
          # Conversion Opportunities
          - Map customer pain points with heritage brands
          - Identify unmet needs and service gaps
          - Highlight demographic and behavioral patterns of customers most likely to switch
          
          # Targeted Strategies
          - Develop segment-specific conversion strategies
          - Outline marketing messages that address emotional and practical switching barriers
          - Create timeline and touchpoint recommendations for the customer journey
          
          # Differentiated Value Proposition
          - Craft compelling reasons to switch that go beyond price
          - Position emerging brand advantages against heritage brand weaknesses
          - Define unique selling propositions for each major customer segment`
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