function Footer() {
  return (
    <footer className="bg-white border-t border-primary-50 py-16 mt-20">
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
            <h4 className="text-primary-600 font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>Audience Intelligence</li>
              <li>Social Intelligence</li>
              <li>Digital Intelligence</li>
              <li>Demand Intelligence</li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="text-right">
            <p className="text-primary-600 font-medium mb-2">Ready to understand your audience?</p>
            <button className="bg-primary hover:bg-primary-hover active:bg-primary-pressed 
                           active:scale-95 transform transition-all duration-150 
                           text-white px-6 py-2 rounded-lg text-sm cursor-pointer">
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-primary-50 text-center text-text-tertiary text-sm">
          <p>© {new Date().getFullYear()} Audiense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 