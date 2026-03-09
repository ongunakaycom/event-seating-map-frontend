import { useState, useEffect } from 'react';
import type { Venue } from './types/venue';
import { SeatMap } from './components/SeatMap/SeatMap';
import { Summary } from './components/Summary/Summary';
import { Container, Row, Col, Button, Offcanvas, Badge, Spinner, Alert } from 'react-bootstrap';

function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetch('/data/venue.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load venue data');
        }
        return res.json();
      })
      .then((data) => {
        setVenue(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleCloseSummary = () => setShowSummary(false);
  const handleShowSummary = () => setShowSummary(true);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading venue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading venue</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!venue) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <p>No venue data available</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3 py-2">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h1 className="h5 mb-1 text-white">{venue.name}</h1>
            <div className="d-flex gap-2 flex-wrap">
              {venue.sections.map((section) => (
                <Badge key={section.id} bg="light" text="dark" className="px-2 py-1">
                  {section.label}: {section.rows.reduce((acc, row) => acc + row.seats.length, 0)} seats
                </Badge>
              ))}
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white-50 d-none d-md-inline">{venue.venueId}</span>
            <Button 
              variant="outline-light" 
              size="sm"
              className="d-md-none"
              onClick={handleShowSummary}
            >
              Summary
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-hidden bg-light">
        <Container fluid className="h-100 py-3">
          <Row className="h-100 g-3">
            {/* Seat Map */}
            <Col md={8} lg={9} className="h-100">
              <div className="bg-white rounded-3 shadow-sm h-100 d-flex flex-column overflow-hidden">
                <div className="p-3 border-bottom bg-light">
                  <h6 className="mb-1 fw-bold">Interactive Seat Map</h6>
                  <small className="text-muted">Click on available seats to select (max 8)</small>
                </div>
                <div className="flex-grow-1 p-3 overflow-auto d-flex justify-content-center align-items-start">
                  <SeatMap venue={venue} />
                </div>
              </div>
            </Col>

            {/* Desktop Summary */}
            <Col md={4} lg={3} className="h-100 d-none d-md-block">
              <div className="bg-white rounded-3 shadow-sm h-100 overflow-auto p-3">
                <Summary />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Mobile Summary Offcanvas */}
      <Offcanvas 
        show={showSummary} 
        onHide={handleCloseSummary} 
        placement="bottom"
        className="rounded-top-4"
        style={{ height: 'auto', maxHeight: '85vh' }}
      >
        <Offcanvas.Header closeButton className="bg-light">
          <Offcanvas.Title>Your Selection</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-3">
          <Summary />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default App;