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
          
          Core Fans Analysis
          | Metric | ${brand1} | ${brand2} | Gap Analysis |
          |--------|-----------|-----------|--------------|
          | Market Share | 16.3% | 41.5% | -25.2% |
          | Engagement Rate | 8.2% | 12.4% | -4.2% |
          | Content Affinity | 85% | 92% | -7% |
          
          ${brand1} has a significant portion of its audience that identifies as fans (16%) and shows a strong affinity for ${brand1}-related content. ${brand2} also shares affinity with similar content but to a lesser extent.
          
          Content Creators Segment
          | Metric | ${brand1} | ${brand2} | Opportunity |
          |--------|-----------|-----------|-------------|
          | Creator Base | 12.5% | 28.4% | +15.9% growth potential |
          | Monetization | 25% | 45% | +20% monetization gap |
          | Tools Usage | 35% | 65% | +30% feature adoption |
          
          ${brand1} shows less engagement with content creators compared to ${brand2}. However, both platforms share an affinity for creative and artistic segments.
          
          Early Adopters Analysis
          | Behavior | ${brand1} | ${brand2} | Action Gap |
          |----------|-----------|-----------|------------|
          | Tech Adoption | 28% | 42% | +14% to close |
          | Feature Usage | 45% | 68% | +23% opportunity |
          | Platform Activity | 3.2h/day | 4.5h/day | +1.3h engagement |
          
          Both platforms engage early adopters, with ${brand2} having a higher share. The affinity for tech enthusiasts and gaming community segments on ${brand2} suggests a more technologically curious audience.
          
          Strategic Recommendations
          | Initiative | Current | Target | Impact |
          |------------|---------|---------|---------|
          | Creator Program | 12.5% | 30% | +17.5% growth |
          | Community Features | 45% | 75% | +30% engagement |
          | Premium Features | 28% | 50% | +22% revenue |
          | Engagement Hooks | 3.2h | 4.5h | +1.3h usage |

          1. Creator Program: Launch a creator program targeting the 'Creatives & Artists' and 'Streamer Community' segments...
          
          2. Community Features: Implementing enhanced community features...
          
          3. Premium Features for Young Professionals: Given the segment's potential for growth...
          
          4. Increase Engagement Hooks: To address the daily usage gap...
          
          Conclusion
          | Key Metric | Current State | Target State | Timeline |
          |------------|---------------|--------------|----------|
          | Market Share | 35% | 55% | Q4 2024 |
          | Creator Base | 12.5k | 25k | Q2 2024 |
          | User Retention | 68% | 85% | Q3 2024 |
          
          The analysis reveals clear opportunities for ${brand1} to focus on its unique strengths...
          
          Provide detailed analysis comparing the reports with focus on market conquest opportunities.`
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