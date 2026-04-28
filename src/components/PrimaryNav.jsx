import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { useSavedCount } from '../hooks/useSavedCount.js';

export default function PrimaryNav() {
  const savedCount = useSavedCount();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Madison ParkWise</Navbar.Brand>
        <Navbar.Toggle aria-controls="primary-nav" />
        <Navbar.Collapse id="primary-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Finder</Nav.Link>
            <Nav.Link as={Link} to="/saved">
              Saved
              {savedCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="ms-1"
                  style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}
                  aria-label={`${savedCount} saved spot${savedCount !== 1 ? 's' : ''}`}
                >
                  {savedCount}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
