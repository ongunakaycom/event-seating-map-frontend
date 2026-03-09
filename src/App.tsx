import { useState, useEffect } from 'react';
import type { Venue } from './types/venue';
import { SeatMap } from './components/SeatMap/SeatMap';
import { Summary } from './components/Summary/Summary';
import { Container, Row, Col, Button, Offcanvas, Badge, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close mobile summary if open
        if (showSummary) {
          setShowSummary(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSummary]); // Add showSummary to dependencies

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
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3 py-2 flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h1 className="h5 mb-0 text-white d-flex align-items-center gap-2">
              <i className="bi bi-building"></i>
              {venue.name}
            </h1>
            <div className="d-flex gap-2 flex-wrap mt-1">
              {venue.sections.map((section) => (
                <Badge key={section.id} bg="light" text="dark" className="px-2 py-1">
                  {section.label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white-50 d-none d-md-inline">
              <i className="bi bi-tag me-1"></i>
              {venue.venueId}
            </span>
            <Button 
              variant="outline-light" 
              size="sm"
              className="d-md-none"
              onClick={handleShowSummary}
              aria-label="Open summary panel"
              aria-expanded={showSummary}
              aria-controls="mobile-summary-offcanvas"
            >
              <i className="bi bi-ticket me-1"></i>
              Summary
              {showSummary && <span className="visually-hidden">(open)</span>}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-hidden">
        <Container fluid className="h-100 py-3">
          <Row className="h-100 g-3">
            {/* Seat Map */}
            <Col md={8} lg={9} className="h-100">
              <div className="bg-white rounded-4 shadow-sm h-100 overflow-hidden d-flex flex-column">
                <div className="flex-grow-1 overflow-auto">
                  <SeatMap venue={venue} />
                </div>
              </div>
            </Col>

            {/* Desktop Summary */}
            <Col md={4} lg={3} className="h-100 d-none d-md-block">
              <div className="bg-white rounded-4 shadow-sm h-100 overflow-auto p-3">
                <Summary />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Mobile Summary Offcanvas */}
      <Offcanvas 
        id="mobile-summary-offcanvas"
        show={showSummary} 
        onHide={handleCloseSummary} 
        placement="bottom"
        className="rounded-top-4"
        style={{ height: 'auto', maxHeight: '85vh' }}
        restoreFocus={true}
        restoreFocusOptions={{
          preventScroll: true
        }}
        onEntered={() => {
          // Focus the close button when offcanvas opens
          const closeButton = document.querySelector('.offcanvas .btn-close') as HTMLButtonElement;
          if (closeButton) {
            closeButton.focus();
          }
        }}
      >
        <Offcanvas.Header closeButton className="bg-light">
          <Offcanvas.Title id="offcanvas-summary-label">
            <i className="bi bi-ticket me-2"></i>
            Your Selection
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-3">
          <Summary />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default App;