import axios from 'axios';
import * as PDFJS from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Configurar el worker de PDF.js
PDFJS.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const API_URL = '/api/openai';  // Usaremos un proxy
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

export const analyzePdfs = async (file1, file2, brandName, competitorName) => {
  try {
    const [text1, text2] = await Promise.all([
      getFileContent(file1),
      getFileContent(file2)
    ]);

    const response = await openai.post('', {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a senior market strategist specializing in customer acquisition and brand transitions.
          Your task is to analyze the provided reports for ${brandName} and ${competitorName} and provide two types of analysis:

          <h1 class="text-3xl font-bold mb-8">Strategic Market Analysis</h1>

          <h2 class="text-2xl font-semibold mb-4">Customer Loyalty Analysis</h2>
          <ul class="space-y-2 mb-6">
            <li>Deep dive into emotional and practical factors driving customer loyalty to ${competitorName}</li>
            <li>Identify specific customer segments and their key loyalty drivers</li>
            <li>Analyze price sensitivity, brand perception, and switching barriers</li>
          </ul>

          <h2 class="text-2xl font-semibold mb-4">Conversion Opportunities</h2>
          <ul class="space-y-2 mb-6">
            <li>Map customer pain points with ${competitorName}</li>
            <li>Identify unmet needs and service gaps</li>
            <li>Highlight demographic and behavioral patterns of customers most likely to switch</li>
          </ul>

          <h2 class="text-2xl font-semibold mb-4">Targeted Strategies</h2>
          <ul class="space-y-2 mb-6">
            <li>Develop segment-specific conversion strategies</li>
            <li>Outline marketing messages that address emotional and practical switching barriers</li>
            <li>Create timeline and touchpoint recommendations for the customer journey</li>
          </ul>

          <h2 class="text-2xl font-semibold mb-4">Differentiated Value Proposition</h2>
          <ul class="space-y-2 mb-6">
            <li>Craft compelling reasons to switch that go beyond price</li>
            <li>Position ${brandName} advantages against ${competitorName} weaknesses</li>
            <li>Define unique selling propositions for each major customer segment</li>
          </ul>

          <h1 class="text-3xl font-bold mt-12 mb-8">${competitorName} vs ${brandName} Audience Segment Comparison</h1>

          <h2 class="text-2xl font-semibold mb-4">Similar Segments Across Both Platforms</h2>
          <table>
            <tr>
              <th>${competitorName} Segment</th>
              <th>${brandName} Segment</th>
              <th>Similarity Notes</th>
            </tr>
            <tr>
              <td>[Segment with emoji]</td>
              <td>[Segment with emoji]</td>
              <td>[Description]</td>
            </tr>
          </table>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Unique ${competitorName} Segments</h2>
          <table>
            <tr>
              <th>Segment</th>
              <th>Size</th>
              <th>Uniqueness Notes</th>
            </tr>
            <tr>
              <td>[Segment with emoji]</td>
              <td>[Size]</td>
              <td>[What makes it unique]</td>
            </tr>
          </table>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Unique ${brandName} Segments</h2>
          <table>
            <tr>
              <th>Segment</th>
              <th>Size</th>
              <th>Uniqueness Notes</th>
            </tr>
            <tr>
              <td>[Segment with emoji]</td>
              <td>[Size]</td>
              <td>[What makes it unique]</td>
            </tr>
          </table>

          <h2 class="text-2xl font-semibold mt-8 mb-4">Key Insights</h2>
          <ol class="space-y-4">
            <li>
              <p class="font-semibold">Content Diversity vs. Niche Interests</p>
              <p class="ml-4">[First insight about content and audience differences]</p>
            </li>
            <li>
              <p class="font-semibold">Platform Strengths</p>
              <p class="ml-4">[Second insight about platform strengths]</p>
            </li>
            <li>
              <p class="font-semibold">Composition Differences</p>
              <p class="ml-4">[Third insight about audience composition]</p>
            </li>
            <li>
              <p class="font-semibold">Growth Opportunities</p>
              <p class="ml-4">[Fourth insight about potential growth]</p>
            </li>
            <li>
              <p class="font-semibold">Potential Strategies</p>
              <p class="ml-4">[Fifth insight about strategic approaches]</p>
            </li>
            <li>
              <p class="font-semibold">Audience Migration Potential</p>
              <p class="ml-4">[Sixth insight about audience movement]</p>
            </li>
            <li>
              <p class="font-semibold">Market Positioning</p>
              <p class="ml-4">[Final insight about market position]</p>
            </li>
          </ol>

          Remember:
          - Keep all emojis in segment names
          - Include audience sizes in parentheses
          - Use the exact HTML structure provided
          - Maintain consistent formatting
          - Keep segment names exactly as they appear
          - Ensure both analyses complement each other`
        },
        {
          role: 'user',
          content: `Please analyze these two reports and provide both the strategic market analysis and audience segment comparison:

          ${brandName} Report:
          ${text1}

          ${competitorName} Report:
          ${text2}

          Follow the exact structure provided and ensure proper formatting for both analyses.`
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