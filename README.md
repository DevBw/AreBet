 # BetHelper - Smart Football Predictions App

A modern, mobile-first web application that provides intelligent football betting predictions and analysis.

## Features

- **Smart Predictions**: AI-powered match predictions based on multiple factors
- **Real-time Odds**: Live betting odds from multiple bookmakers
- **Team Analysis**: Comprehensive team statistics and form analysis
- **Mobile First**: Optimized for mobile devices with responsive design
- **Interactive UI**: Smooth animations and modern user interface
- **Match Tracking**: Save and track your favorite matches
- **Multiple Leagues**: Support for Premier League, La Liga, Serie A, Bundesliga, and more

## Screenshots

The app features a clean, modern design with:
- Featured match predictions with detailed analysis
- Win probability indicators
- Team form visualization
- Quick betting actions
- Bottom navigation for easy access to different sections

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Icons**: Remix Icons
- **Fonts**: Inter (primary), Pacifico (brand)
- **Build Tools**: HTTP Server, Live Server

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bethelper/bethelper-app.git
   cd bethelper-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### Running the App

- **Development**: `npm run dev` - Starts live server with auto-reload
- **Production**: `npm start` - Starts HTTP server for production use

### Features Overview

1. **Home Screen**: 
   - Featured match with detailed predictions
   - Today's predictions list
   - Date filters (Today, Tomorrow, Weekend)

2. **Match Cards**:
   - Team logos and names
   - Win probability percentages
   - Form indicators (last 5 matches)
   - Expected goals and recommendations
   - Save/Bet action buttons

3. **Navigation**:
   - Bottom tab navigation
   - Floating action button for quick actions
   - Top navigation with search and notifications

4. **Interactive Elements**:
   - Save matches to favorites
   - External betting platform integration
   - Modal dialogs for actions
   - Smooth animations and transitions

## Project Structure

```
bethelper-app/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom CSS styles
├── js/
│   └── app.js          # JavaScript functionality
├── package.json        # Project metadata and dependencies
└── README.md          # This file
```

## Customization

### Colors
The app uses a custom color scheme defined in Tailwind config:
- Primary: `#00a651` (Green)
- Secondary: `#2d3748` (Dark gray)

### Fonts
- **Inter**: Main UI font
- **Pacifico**: Brand/logo font

### Icons
Uses Remix Icons for consistent iconography throughout the app.

## API Integration

The app is now integrated with **API-Football** for real-time football data. 

### Quick Setup
1. Get your free API key from [API-Football](https://www.api-football.com/)
2. Start the app and enter your API key when prompted
3. Enjoy real match data, statistics, and predictions!

### Features
- **Real-time matches**: Live scores and upcoming fixtures
- **Team statistics**: Form, head-to-head records, and performance data
- **League information**: Standings, schedules, and team rosters
- **Predictions**: AI-powered match predictions and betting recommendations
- **Caching**: Intelligent caching to reduce API calls and improve performance

### Documentation
See [API_INTEGRATION.md](API_INTEGRATION.md) for detailed setup instructions and API documentation.

### API Limits
- **Free tier**: 100 requests per day
- **Paid tiers**: 1000+ requests per day with additional features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Real-time match updates
- [ ] Push notifications
- [ ] Betting history tracking
- [ ] Advanced statistics and analytics
- [ ] Social features (sharing predictions)
- [ ] Multiple language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) capabilities

## Disclaimer

This app is for educational purposes only. Please gamble responsibly and be aware of the risks involved in betting. The predictions provided are based on statistical analysis and should not be considered as guaranteed outcomes.

---

**BetHelper Team** - Making smart betting decisions easier 