import axios from 'axios';
import * as PDFJS from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Configurar el worker de PDF.js
PDFJS.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com/api/openai'  // Necesitamos una URL real del backend
  : 'http://localhost:3000/api/openai';

const MODEL = 'gpt-4-0125-preview';

const getApiKey = () => {
  // En desarrollo
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  // En producción
  return window.__OPENAI_API_KEY__;
};

const openai = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
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
    const formData = new FormData();
    formData.append('pdf1', pdf1);
    formData.append('pdf2', pdf2);
    formData.append('brand1', brand1);
    formData.append('brand2', brand2);

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
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