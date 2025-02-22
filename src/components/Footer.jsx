function Footer() {
  return (
    <footer className="bg-white py-16 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <img 
              src={new URL('../assets/audiense-logo-black.svg', import.meta.url).href}
              alt="Audiense Logo"
              className="h-8"
            />
            <p className="text-text-tertiary text-sm">
              Transform audience research into actionable insights. Understand what inspires your audience, moves them, and influences them.
            </p>
          </div>

          {/* Productos */}
          <div>
            <h4 className="text-primary-600 font-semibold mb-4">Products & Plans</h4>
            <div className="space-y-6">
              {/* Audience Intelligence Section */}
              <div>
                <p className="font-bold text-primary-600 mb-2">AUDIENCE INTELLIGENCE</p>
                <ul className="space-y-2">
                  <li><a href="https://www.audiense.com/products/audiense-insights"  target="_blank"  className="text-text-secondary text-sm hover:text-primary-600">Social Intelligence</a></li>
                  <li><a href="https://www.audiense.com/products/digital-intelligence"  target="_blank" className="text-text-secondary text-sm hover:text-primary-600">Digital Intelligence</a></li>
                  <li><a href="https://www.audiense.com/products/demand-intelligence" target="_blank" className="text-text-secondary text-sm hover:text-primary-600">Demand Intelligence</a></li>
                  <li><a href="https://www.audiense.com/pricing-pages/audience-intelligence" target="_blank" className="text-text-secondary text-sm hover:text-primary-600">Plans</a></li>
                </ul>
              </div>
              
              {/* X Marketing Section */}
              <div>
                <p className="font-bold text-primary-600 mb-2">X MARKETING</p>
                <ul className="space-y-2">
                  <li><a href="https://www.audiense.com/products/audiense-connect" target="_blank" className="text-text-secondary text-sm hover:text-primary-600">Audiense Connect</a></li>
                  <li><a href="https://www.tweetbinder.com/" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-sm hover:text-primary-600">Tweet Binder</a></li>
                  <li><a href="https://www.audiense.com/pricing-pages/twitter-marketing" target="_blank" className="text-text-secondary text-sm hover:text-primary-600">Plans</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-right">
            <p className="text-primary-600 font-medium mb-2">Ready to understand your audience?</p>
            <a 
              href="https://www.audiense.com/pricing-pages/audience-intelligence"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary hover:bg-primary-hover active:bg-primary-pressed 
                       active:scale-95 transform transition-all duration-150 
                       text-white px-6 py-2 rounded-lg text-sm cursor-pointer">
              Start Free Trial
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 text-center text-text-tertiary text-sm">
          <p>© {new Date().getFullYear()} Audiense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 