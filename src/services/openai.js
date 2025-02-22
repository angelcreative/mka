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
          content: `You are a market conquest strategist analyzing ${brand1} and ${brand2} audience data. Your goal is to help ${brand1} capture ${brand2}'s market share.
          
          1. Segment Overlap Analysis
          | Segment | ${brand1} (%) | ${brand2} (%) | Overlap Impact |
          |---------|---------------|---------------|----------------|
          | Core Fans | 35.2 | 42.8 | High - Primary target |
          | Content Creators | 12.5 | 28.4 | Medium - Growth opportunity |
          | Early Adopters | 8.3 | 15.7 | High - Strategic value |

          2. Segment Distribution
          | Category | Current Share | Growth Rate | Position |
          |----------|--------------|-------------|----------|
          | Premium Users | 28% | +15% YoY | Challenger |
          | Active Engagers | 45% | +22% YoY | Leader |
          
          3. Growth Opportunities
          | Segment | Current Share | Target Share | Growth Strategy |
          |---------|--------------|--------------|-----------------|
          | Young Professionals | 18.5% | 35% | Premium features + Social proof |
          | Content Creators | 12.5% | 30% | Creator tools & monetization |

          4. Quantitative Metrics Table
          | Metric | ${brand1} | ${brand2} | Gap/Opportunity |
          |--------|-----------|-----------|----------------|
          | Engagement Rate | 3.2% | 4.8% | +1.6% to close |
          | Retention Rate | 68% | 72% | +4% to match |
          | Growth Velocity | 15% | 22% | +7% acceleration needed |

          5. Qualitative Value Assessment
          | Aspect | ${brand1} | ${brand2} | Strategic Implications |
          |--------|-----------|-----------|----------------------|
          | Brand Loyalty | Medium-High | Very High | Need stronger community features |
          | Content Quality | Premium | Mixed | Leverage quality advantage |

          6. Market Position Analysis
          - Current market dynamics
          - Competitive advantages
          - Key differentiators
          - Strategic opportunities
          
          7. Behavioral Insights
          | Behavior | ${brand1} | ${brand2} | Action Points |
          |----------|-----------|-----------|---------------|
          | Daily Usage | 42 mins | 58 mins | Increase engagement hooks |
          | Content Creation | 15% | 25% | Simplify creation tools |

          8. Strategic Recommendations
          | Initiative | Impact | Priority | Timeline |
          |------------|--------|----------|----------|
          | Creator Program | High (+25% growth) | P0 | Q2 2024 |
          | Community Features | Medium (+15% retention) | P1 | Q3 2024 |

          Guidelines:
          - Focus on conquest opportunities
          - Quantify all possible metrics
          - Identify clear competitive advantages
          - Highlight actionable growth strategies
          - Show specific market capture tactics
          
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