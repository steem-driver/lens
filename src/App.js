import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import TradeTable from './TradeTable';
import TradeHistoryTable from './TradeHistoryTable';
import { Container, Row, Col } from 'react-bootstrap';


function App({ location }) {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  return (
    <div>
      <h2>
        { token } Market
      </h2>
      <br />

      <Container>
        { /*<Row>
          <Col>
            <h3>People Buying {token}</h3>
            <TradeTable token={token} table="buyBook" index="price" descending={true} />
          </Col>
          <Col>
            <h3>People Selling {token}</h3>
            <TradeTable token={token} table="sellBook" index="price" descending={false} />
          </Col>
        </Row> */}
        <Row>
          <Col>
            <h3>{token} Trade History</h3>
            <TradeTable token={token} table="tradesHistory" index="timestamp" descending={false} />
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>{token} Trade History with Buyers and Sellers</h3>
            <TradeHistoryTable token={token} index="timestamp" descending={false}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function AppRouter() {
  return (
    <Router>
      <Route component={App} />
    </Router>
  );
}

export default AppRouter;
