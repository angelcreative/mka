import PdfAnalyzer from './components/PdfAnalyzer';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-12">
          <img 
            src="https://cdn.prod.website-files.com/61a61781d327712f7cb32e56/67b9dbc1b8f175058773ceae_labs.svg"
            alt="Audiense Logo"
            className="h-12 mx-auto mb-6"
            style={{ maxWidth: '120px' }} />
          <div className="mx-auto">
            <h1 className="text-6xl font-bold text-primary-600 leading-tight">
              Market Conquest Agent
            </h1>
            <sub className="text-text-tertiary">Using Audiense Ai technology</sub>
          </div>
          <p className="text-2xl text-text-secondary max-w-2xl mx-auto">
            Transform market research into actionable strategies to convert your competitor's loyal customers into your brand advocates
          </p>
        </div>
        <PdfAnalyzer />
      </div>
      <Footer />
    </div>
  )
}

export default App 