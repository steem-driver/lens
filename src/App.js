import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import TradeTable from './TradeTable';
import TradeHistoryTable from './TradeHistoryTable';
import RichListTable from './RichListTable';

const APP_NAME = "lens";

const App = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "ENG";
  const page = params.get("page") || "open_order";

  const selectBody = () => {
    switch(page) {
      case "open_order": return OpenOrder;
      case "trade_history": return TradeHistory;
      case "rich_list": return RichList;
      default: return null;
    }
  };
  const Body = selectBody();

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
          <Link className="nav-link" to={`/${APP_NAME}?page=open_order&token=${token}`}>Open Orders</Link>
          <Link className="nav-link" to={`/${APP_NAME}?page=trade_history&token=${token}`}>Trade History</Link>
          <Link className="nav-link" to={`/${APP_NAME}?page=rich_list&token=${token}`}>Rich List</Link>
        </Nav>
      </Navbar>
      <br />

      <Body token={token} />
    </div>
  );
}

const OpenOrder = ({token}) => {
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

const TradeHistory = ({token}) => {
  return ( <Container>
    <Row>
      <Col>
        <h3>{token} Trade History</h3>
        <TradeTable token={token} table="tradesHistory" index="timestamp" descending={false} />
        <br /> <br />
      </Col>
      <Col>
        <h3>{token} Trade History with Buyers and Sellers</h3>
        <TradeHistoryTable token={token} index="timestamp" descending={false}/>
      </Col>
    </Row>
  </Container> );
}

const RichList = ({token}) => {
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
      <Route path={`/${APP_NAME}`} component={App}/>
    </Router>
  );
}

export default AppRouter;
