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
          <Nav.Link as={Link} to="/saved">Saved</Nav.Link>
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

const SavedSpotCard = ({ street, side, rules, area }) => (
  <Card className="h-100 shadow-sm">
    <Card.Body>
      <Card.Title>{street}</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">{side} Side</Card.Subtitle>
      <Card.Text>
        <strong>Area:</strong> {area}
      </Card.Text>
      <Card.Text>
        <strong>Rules:</strong> {rules}
      </Card.Text>
      <Button variant="outline-primary" size="sm">Open Street</Button>
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

const savedLocations = [
  {
    id: 1,
    street: 'State St',
    side: 'North',
    area: 'Downtown Madison',
    rules: '2-hour parking, 8am-6pm'
  },
  {
    id: 2,
    street: 'W Johnson St',
    side: 'South',
    area: 'Near UW Campus',
    rules: 'Permit parking after 5pm'
  },
  {
    id: 3,
    street: 'N Frances St',
    side: 'East',
    area: 'College Library Area',
    rules: 'Weekend enforcement only'
  },
  {
    id: 4,
    street: 'Langdon St',
    side: 'West',
    area: 'Near Memorial Union',
    rules: '1-hour parking, no overnight parking'
  }
];

const SavedPage = () => (
  <Container className="py-4">
    <h2 className="mb-3">Saved Parking Streets</h2>
    <p className="text-muted">
      These are your initial saved parking locations for now.
    </p>

    <Row className="g-4 mt-1">
      {savedLocations.map((spot) => (
        <Col md={6} lg={4} key={spot.id}>
          <SavedSpotCard
            street={spot.street}
            side={spot.side}
            area={spot.area}
            rules={spot.rules}
          />
        </Col>
      ))}
    </Row>
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
            <Route path="/saved" element={<SavedPage />} />
          </Routes>
        </Container>
        <footer className="text-center mt-5 py-3 text-muted">
          &copy; 2024 Madison Parking Project
        </footer>
      </div>
    </Router>
  );
}