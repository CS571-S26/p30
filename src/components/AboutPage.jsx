import React from 'react';
import { Container, Card } from 'react-bootstrap';

export default function AboutPage() {
  return (
    <Container className="py-4">
      <h2 className="mb-3">About Madison ParkWise</h2>
      <p className="text-muted">
        Madison ParkWise helps you find ADA on-street parking in Madison, WI.
      </p>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Card.Title>Project Overview</Card.Title>
          <Card.Text>
            This app uses your GPS location and the City of Madison&rsquo;s ADA parking
            dataset to show the nearest accessible spaces within your chosen radius.
          </Card.Text>
          <Card.Text>
            Built with React, React Router, and React Bootstrap.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}
