import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './App.css';
import PrimaryNav from './components/PrimaryNav.jsx';
import FinderPage from './components/FinderPage.jsx';
import SavedPage from './components/SavedPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import PlanVisitPage from './components/PlanVisitPage.jsx';

export default function App() {
  return (
    <Router basename="/p30">
      <div className="App">
        <PrimaryNav />
        <Container>
          <Routes>
            <Route path="/" element={<FinderPage />} />
            <Route path="/plan" element={<PlanVisitPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Container>
        <footer className="text-center mt-5 py-3 text-muted">
          &copy; 2026 Madison Parking Project
        </footer>
      </div>
    </Router>
  );
}
