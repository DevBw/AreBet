import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Loader from './components/Loader.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Matches = lazy(() => import('./pages/Matches.jsx'));
const LiveMatches = lazy(() => import('./pages/LiveMatches.jsx'));
const Fixtures = lazy(() => import('./pages/Fixtures.jsx'));
const Leagues = lazy(() => import('./pages/Leagues.jsx'));
const Teams = lazy(() => import('./pages/Teams.jsx'));
const Statistics = lazy(() => import('./pages/Statistics.jsx'));
const Predictions = lazy(() => import('./pages/Predictions.jsx'));
const Trends = lazy(() => import('./pages/Trends.jsx'));
const MatchDetail = lazy(() => import('./pages/MatchDetail.jsx'));
const TeamProfile = lazy(() => import('./pages/TeamProfile.jsx'));
const LeagueDetail = lazy(() => import('./pages/LeagueDetail.jsx'));

export default function App() {
  return (
    <MainLayout>
      <Suspense fallback={<Loader label="Loading page" />}> 
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/live" element={<LiveMatches />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/match/:matchId" element={<MatchDetail />} />
          <Route path="/team/:teamId" element={<TeamProfile />} />
          <Route path="/league/:leagueId" element={<LeagueDetail />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}


