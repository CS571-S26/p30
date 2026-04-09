import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PrimaryNav = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
    <Container>
      <Navbar.Brand as={Link} to="/">Madison ParkWise</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Finder</Nav.Link>
          <Nav.Link as={Link} to="/saved">Saved</Nav.Link>
          <Nav.Link as={Link} to="/about">About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

const SearchFilters = () => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  return (
    <Card className="p-3 shadow-sm border-0">
      <h5 className="mb-3 fw-bold text-dark">Find Parking</h5>

      <div
        className="sliding-toggle-wrapper mb-4"
        onClick={() => setUseCurrentLocation(!useCurrentLocation)}
      >
        <div className={`selection-pill${useCurrentLocation ? ' is-right' : ''}`} />

        <div className="toggle-option">
          <span style={{ color: !useCurrentLocation ? 'white' : '#6c757d' }}>
            Manual
          </span>
        </div>

        <div className="toggle-option">
          <span style={{ color: useCurrentLocation ? 'white' : '#6c757d' }}>
            Current
          </span>
        </div>
      </div>

      <Form>
        {!useCurrentLocation && (
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Street Address</Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="e.g. 716 Langdon St"
                className="border-end-0"
              />
              <Button
                variant="outline-secondary"
                className="border-start-0"
                style={{ borderColor: '#dee2e6' }}
              >
                Find
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              Enter an address or intersection.
            </Form.Text>
          </Form.Group>
        )}

        {useCurrentLocation && (
          <div className="mb-3 py-2 text-center text-primary small fw-medium">
            Using your GPS location...
          </div>
        )}

        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Parking Radius</Form.Label>
          <Form.Select>
            <option>Within 2 blocks</option>
            <option>Within 5 blocks</option>
            <option>Within 10 blocks</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check type="checkbox" label="Weekend Parking" className="small" />
          <Form.Check type="checkbox" label="Free Spots Only" className="small" />
        </Form.Group>

        <Button variant="primary" className="w-100 fw-bold shadow-sm">
          Apply Filters
        </Button>
      </Form>
    </Card>
  );
};

const ParkingSpot = ({ street, side, rules }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{street}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{side} Side</Card.Subtitle>
          <Card.Text>{rules}</Card.Text>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            View Details
          </Button>
        </Card.Body>
      </Card>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '360px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
            }}
          >
            <h5 className="fw-bold mb-1">{street}</h5>
            <p className="text-muted small mb-3">{side} Side · Street Parking</p>
            <hr />
            <p className="small mb-1"><strong>Hours:</strong> Mon–Fri, 8:00am – 6:00pm</p>
            <p className="small mb-1"><strong>Limit:</strong> {rules}</p>
            <p className="small mb-1"><strong>Permit Required:</strong> No</p>
            <p className="small mb-3"><strong>Estimated Spots:</strong> 6–8 spaces</p>
            <Button
              variant="primary"
              className="w-100"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

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
      <Button variant="outline-primary" size="sm">
        Open Street
      </Button>
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
      <ParkingSpot
        street="W Washington Ave"
        side="North"
        rules="2-hour limit, 8am-6pm"
      />
      <ParkingSpot
        street="N Frances St"
        side="East"
        rules="Weekend enforcement only"
      />
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

const AboutPage = () => (
  <Container className="py-4">
    <h2 className="mb-3">About Madison ParkWise</h2>
    <p className="text-muted">
      Madison ParkWise is a parking finder app prototype designed to help users
      explore street parking options in Madison.
    </p>

    <Card className="shadow-sm border-0">
      <Card.Body>
        <Card.Title>Project Overview</Card.Title>
        <Card.Text>
          This app lets users search for nearby parking, view saved streets, and
          explore parking rules in a simple interface.
        </Card.Text>
        <Card.Text>
          It was built with React, React Router, and React Bootstrap as a student
          web project.
        </Card.Text>
      </Card.Body>
    </Card>
  </Container>
);

// TODO: debug router
export default function App() {
  return (
    <Router basename="/p30">
      <div className="App">
        <PrimaryNav />
        <Container>
          <Routes>
            <Route path="/" element={<FinderPage />} />
            <Route path="/saved" element={<SavedPage />} />
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