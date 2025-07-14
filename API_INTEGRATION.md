# API-Football Integration Guide

This guide explains how to integrate the API-Football service into your BetHelper application.

## Overview

The API-Football integration provides real-time football data including:
- Live matches and scores
- Team statistics and form
- League standings
- Head-to-head records
- Match predictions and odds
- Player information

## Setup Instructions

### 1. Get API Key

1. Visit [API-Football](https://www.api-football.com/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key

### 2. Configure the App

#### Option A: Through the App UI (Recommended)
1. Start the app
2. When prompted, enter your API key in the setup modal
3. The key will be saved automatically

#### Option B: Manual Configuration
1. Open `js/config.js`
2. Replace `'YOUR_API_FOOTBALL_KEY'` with your actual API key
3. Save the file

### 3. API Limits

**Free Tier:**
- 100 requests per day
- Basic endpoints available
- Rate limit: 30 requests per minute

**Paid Tiers:**
- 1000+ requests per day
- All endpoints available
- Higher rate limits
- Priority support

## Available Endpoints

### Matches & Fixtures
```javascript
// Get today's matches
const todayMatches = await apiService.getTodayMatches();

// Get tomorrow's matches
const tomorrowMatches = await apiService.getTomorrowMatches();

// Get weekend matches
const weekendMatches = await apiService.getWeekendMatches();

// Get live matches
const liveMatches = await apiService.getLiveMatches();

// Get specific fixture
const fixture = await apiService.getFixture(fixtureId);
```

### Teams & Leagues
```javascript
// Get leagues
const leagues = await apiService.getLeagues();

// Get teams in a league
const teams = await apiService.getTeams(leagueId, season);

// Get team statistics
const stats = await apiService.getTeamStatistics(teamId, leagueId, season);

// Get team form
const form = await apiService.getTeamForm(teamId, leagueId, season);
```

### Analysis & Predictions
```javascript
// Get head-to-head statistics
const h2h = await apiService.getHeadToHead(team1Id, team2Id);

// Get match predictions
const predictions = await apiService.getPredictions(fixtureId);

// Get betting odds
const odds = await apiService.getOdds(fixtureId);
```

## Data Structure

### Match Object
```javascript
{
  id: 123456,
  date: "2024-01-15T20:00:00+00:00",
  timestamp: 1705334400,
  status: {
    long: "Match Finished",
    short: "FT"
  },
  league: {
    id: 39,
    name: "Premier League",
    country: "England",
    logo: "https://media.api-sports.io/football/leagues/39.png",
    flag: "https://media.api-sports.io/flags/gb.svg"
  },
  teams: {
    home: {
      id: 40,
      name: "Liverpool",
      logo: "https://media.api-sports.io/football/teams/40.png",
      winner: true
    },
    away: {
      id: 33,
      name: "Manchester United",
      logo: "https://media.api-sports.io/football/teams/33.png",
      winner: false
    }
  },
  goals: {
    home: 2,
    away: 1
  },
  score: {
    halftime: { home: 1, away: 0 },
    fulltime: { home: 2, away: 1 }
  }
}
```

## Error Handling

The API service includes comprehensive error handling:

```javascript
try {
  const matches = await apiService.getTodayMatches();
  // Process data
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error (show notification, fallback data, etc.)
}
```

Common error scenarios:
- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: API server issues
- **Network errors**: Connection problems

## Caching

The app implements intelligent caching to reduce API calls:

- **Cache duration**: 5 minutes (configurable)
- **Cache keys**: Based on endpoint and parameters
- **Automatic cleanup**: Expired cache entries are removed

## Configuration Options

Edit `js/config.js` to customize:

```javascript
window.BetHelperConfig = {
  api: {
    key: 'your-api-key',
    baseURL: 'https://v3.football.api-sports.io',
    rateLimit: 30,
    cacheEnabled: true,
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }
};
```

## Popular League IDs

```javascript
const leagues = {
  premierLeague: 39,    // England
  laLiga: 140,          // Spain
  serieA: 135,          // Italy
  bundesliga: 78,       // Germany
  ligue1: 61,           // France
  championsLeague: 2,   // UEFA
  europaLeague: 3       // UEFA
};
```

## Testing the Integration

1. Start the app: `npm run dev`
2. Set your API key
3. Navigate to different date tabs (Today, Tomorrow, Weekend)
4. Check the browser console for API requests
5. Verify that real match data is displayed

## Troubleshooting

### No matches showing
- Check if your API key is valid
- Verify the date range has matches
- Check browser console for errors

### API errors
- Ensure you haven't exceeded daily limits
- Check your internet connection
- Verify the API service is operational

### Caching issues
- Clear browser cache
- Check if cache is enabled in config
- Restart the app

## Best Practices

1. **Rate Limiting**: Respect API rate limits
2. **Caching**: Use cached data when possible
3. **Error Handling**: Always handle API errors gracefully
4. **User Feedback**: Show loading states and error messages
5. **Fallback Data**: Provide mock data when API is unavailable

## Support

- API Documentation: [API-Football Docs](https://www.api-football.com/documentation-v3)
- API Status: [Status Page](https://status.api-football.com/)
- Support: Contact API-Football support for API-related issues

## License

This integration is part of the BetHelper project and follows the same MIT license. 