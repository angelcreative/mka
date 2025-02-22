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
          content: `You are a senior market strategist analyzing ${brand1} and ${brand2} audience data.
          
          Structure your analysis with these key sections using markdown:
          
          1. Segment Overlap Analysis
          A. Direct Overlap Table:
          | Segment | ${brand1} (%) | ${brand2} (%) | Overlap Impact |
          |---------|---------------|---------------|----------------|
          
          B. Segment Distribution:
          | Category | ${brand1} Share | ${brand2} Share | Market Position |
          |----------|----------------|----------------|-----------------|
          
          C. Growth Opportunities:
          | Segment | Current Share | Target Share | Growth Strategy |
          |---------|--------------|--------------|-----------------|
          
          2. Audience Value Analysis
          A. Quantitative Metrics Table:
          | Metric | ${brand1} | ${brand2} | Gap/Opportunity |
          |--------|-----------|-----------|-----------------|
          Key Metrics to Compare:
          - Engagement Rate (%)
          - Content Interaction (%)
          - Platform Activity (%)
          - Growth Velocity (%)
          - Retention Rate (%)
          - Cross-platform Presence (%)
          
          B. Qualitative Value Assessment:
          | Aspect | ${brand1} | ${brand2} | Strategic Implications |
          |--------|-----------|-----------|----------------------|
          Analyze:
          - Content preferences
          - Behavioral patterns
          - Cultural alignment
          - Community engagement
          
          3. Competitive Position Matrix
          A. Market Position Table:
          | Category | ${brand1} Strength | ${brand2} Strength | Market Opportunity |
          |----------|-------------------|-------------------|-------------------|
          
          B. Brand Perception Analysis:
          | Dimension | ${brand1} Perception | ${brand2} Perception | Key Differentiators |
          |-----------|---------------------|---------------------|-------------------|
          Include:
          - Brand values alignment
          - Content quality perception
          - Platform experience
          - Community sentiment
          
          4. Customer Loyalty Analysis
          A. Loyalty Drivers Table:
          | Driver | ${brand1} Impact | ${brand2} Impact | Retention Opportunity |
          |--------|----------------|----------------|---------------------|
          
          B. Qualitative Insights:
          - Deep dive into emotional and practical factors
          - Key loyalty drivers by segment
          - Brand perception analysis
          - Community belonging factors
          - Content resonance patterns
          
          5. Conversion Opportunities
          A. Conversion Potential Matrix:
          | Segment | Current State | Target State | Action Points |
          |---------|--------------|--------------|---------------|
          
          B. Behavioral Analysis:
          - Customer pain points
          - Unmet needs and gaps
          - High-potential segments for conversion
          - Content consumption patterns
          - Platform interaction styles
          
          6. Strategic Recommendations
          A. Strategy Priority Matrix:
          | Initiative | Impact | Effort | Timeline | Priority |
          |------------|--------|--------|----------|----------|
          
          B. Implementation Framework:
          - Segment-specific strategies
          - Value proposition enhancements
          - Customer journey optimization
          - Content strategy alignment
          - Community building tactics
          
          Guidelines:
          - Focus on actionable insights
          - Include only relevant data points
          - Ensure all segments mentioned have clear metrics
          - Avoid empty or low-value sections
          - Use clear, business-focused language
          - Present quantitative comparisons in tables
          - Include market context and implications
          - Highlight competitive advantages and gaps
          - Balance data with qualitative insights
          - Consider cultural and behavioral factors
          - Analyze content-audience fit
          - Evaluate community dynamics
          
          Focus your analysis on comparing the audience reports.`
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