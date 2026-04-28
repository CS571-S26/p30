import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function AboutPage() {
  return (
    <Container className="py-4">
      <h2 className="mb-1">About Madison ParkWise</h2>
      <p className="lead text-muted mb-4">
        A web app for finding ADA-accessible on-street parking in Madison, WI.
      </p>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title as="h3" className="fs-6">How It Works</Card.Title>
              <Card.Text className="small">
                Enter a street address or use your device&rsquo;s GPS to set your
                origin. Results appear as red dots on the interactive map and in
                the scrollable list below the filter panel.
              </Card.Text>
              <Card.Text className="small">
                Click any dot on the map to view spot details and save it.
                Click any row in the list to fly the map directly to that spot.
                Use <strong>Nearest 10 spots</strong> to ignore the radius filter
                and always see the closest available spaces.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title as="h3" className="fs-6">Filters</Card.Title>
              <Card.Text className="small">
                <strong>Parking Radius</strong> — choose from 2, 5, or 10 blocks,
                or switch to Nearest 10 for a top-10 list regardless of distance.
              </Card.Text>
              <Card.Text className="small">
                <strong>Weekend Parking</strong> — hides spots that are only
                enforced on weekdays, so you only see spots available on
                Saturday &amp; Sunday.
              </Card.Text>
              <Card.Text className="small">
                <strong>Free Spots Only</strong> — excludes metered or paid spaces,
                showing only no-cost ADA spots.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title as="h3" className="fs-6">Data Source</Card.Title>
              <Card.Text className="small">
                Parking data is sourced from the{' '}
                <a
                  href="https://data.cityofmadison.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  City of Madison Open Data Portal
                </a>{' '}
                (On-Street ADA Parking Spaces dataset). Coordinates are projected
                from EPSG:8193 (NAD83(HARN) / WISCRS Dane County, ftUS) using
                the <strong>proj4</strong> library.
              </Card.Text>
              <Card.Text className="small">
                Address geocoding is provided by{' '}
                <a href="https://nominatim.org" target="_blank" rel="noreferrer">
                  Nominatim / OpenStreetMap
                </a>{' '}
                — no API key required.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title as="h3" className="fs-6">Built With</Card.Title>
              <ul className="small text-muted mb-0 ps-3">
                <li>React 19 + Vite</li>
                <li>React Bootstrap 2 (Bootstrap 5)</li>
                <li>React Router 7</li>
                <li>React Leaflet + OpenStreetMap tiles</li>
                <li>proj4 for coordinate projection</li>
                <li>Nominatim for address geocoding</li>
              </ul>
              <hr className="my-2" />
              <p className="small text-muted mb-0">
                Spot data is cached in memory after the first load.
                Search state is preserved in <code>sessionStorage</code>{' '}
                so navigating to Saved and back restores your last query.
                Saved spots persist in <code>localStorage</code>.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
