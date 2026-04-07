import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrimaryNav = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
    <Container>
      <Navbar.Brand as={Link} to="/">Madison ParkWise</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Finder</Nav.Link>
          <Nav.Link as={Link} to="/about">About Project</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

const SearchFilters = () => (
  <Card className="p-3 shadow-sm">
    <h5>Refine Search</h5>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Parking Radius</Form.Label>
        <Form.Select>
          <option>Within 2 blocks</option>
          <option>Within 5 blocks</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check type="checkbox" label="Weekend Parking" />
        <Form.Check type="checkbox" label="Free Spots Only" />
      </Form.Group>
      <Button variant="primary" className="w-100">Apply Filters</Button>
    </Form>
  </Card>
);

const ParkingSpot = ({ street, side, rules }) => (
  <Card className="mb-3">
    <Card.Body>
      <Card.Title>{street}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">{side} Side</Card.Subtitle>
      <Card.Text>{rules}</Card.Text>
      <Button variant="outline-success" size="sm">View Details</Button>
    </Card.Body>
  </Card>
);

const FinderPage = () => (
  <Row>
    <Col md={4} className="mb-4">
      <SearchFilters />
    </Col>
    <Col md={8}>
      <h3>Nearby Madison Spots</h3>
      <ParkingSpot street="W Washington Ave" side="North" rules="2-hour limit, 8am-6pm" />
      <ParkingSpot street="N Frances St" side="East" rules="Weekend enforcement only" />
    </Col>
  </Row>
);

const AboutPage = () => (
  <Container className="py-5 bg-light rounded shadow-sm">
    <h2>About Madison ParkWise</h2>
    <p>Using the City of Madison Open Data portal, we help students and residents find street parking quickly.</p>
    <ul>
      <li>Feature 1: Filter by regulations</li>
      <li>Feature 2: Radius-based searching</li>
      <li>Future: Interactive Map Pins</li>
    </ul>
  </Container>
);

export default function App() {
  return (
    <Router>
      <div className="App">
        <PrimaryNav />
        <Container>
          <Routes>
            <Route path="/" element={<FinderPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Container>
        <footer className="text-center mt-5 py-3 text-muted">
          &copy; 2024 Madison Parking Project
        </footer>
      </div>
    </Router>
  );
}