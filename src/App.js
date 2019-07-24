import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import TradeTable from './TradeTable';
import TradeHistoryTable from './TradeHistoryTable';
import RichListTable from './RichListTable';


const Header = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>
          <img
            alt=""
            src="/favicon.ico"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          {' Lens' }
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Link className="nav-link" to={`/open_order?token=${token}`}>Open Orders</Link>
          <Link className="nav-link" to={`/trade_history?token=${token}`}>Trade History</Link>
          <Link className="nav-link" to={`/rich_list?token=${token}`}>Rich List</Link>
        </Nav>
      </Navbar>
      <br />
    </div>
  );
}

const OpenOrder = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  return ( <Container>
    <Row>
      <Col>
        <h3>People Buying {token}</h3>
        <TradeTable token={token} table="buyBook" index="price" descending={true} />
      </Col>
      <Col>
        <h3>People Selling {token}</h3>
        <TradeTable token={token} table="sellBook" index="price" descending={false} />
      </Col>
    </Row>
  </Container> );
}

const TradeHistory = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  return ( <Container>
    <Row>
      <Col>
        <h3>{token} Trade History</h3>
        <TradeTable token={token} table="tradesHistory" index="timestamp" descending={false} />
      </Col>
      <Col>
        <h3>{token} Trade History with Buyers and Sellers</h3>
        <TradeHistoryTable token={token} index="timestamp" descending={false}/>
      </Col>
    </Row>
  </Container> );
}

const RichList = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  return ( <Container>
    <Row>
      <Col>
        <h3>{token} Rich List</h3>
        <RichListTable token={token} index="effectiveStake" descending={true}/>
      </Col>
    </Row>
  </Container> );
}


function AppRouter() {
  return (
    <Router>
      <Route component={Header}/>
      <Route path="/" exact component={OpenOrder} />
      <Route path="/open_order" component={OpenOrder} />
      <Route path="/trade_history" component={TradeHistory} />
      <Route path="/rich_list" component={RichList} />
    </Router>
  );
}

export default AppRouter;
