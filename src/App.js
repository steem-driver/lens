import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import TradeTable from './TradeTable';
import TradeHistoryTable from './TradeHistoryTable';
import RichListTable from './RichListTable';
import TransferTable from './TransferTable';
import DelegationTable from './DelegationTable';
import DelegationHistoryTable from './DelegationHistoryTable';

const APP_NAME = "lens";

const App = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const account = params.get("account")
  const token = params.get("token") || (account ? "" : "ENG");
  const page = params.get("page") || "open_order";

  const selectBody = () => {
    switch(page) {
      case "open_order": return OpenOrder;
      case "trade_history": return TradeHistory;
      case "rich_list": return RichList;
      case "transfer": return Transfers;
      case "delegation": return Delegations;
      default: return null;
    }
  };
  const Body = selectBody();
  let url_params = '';
  url_params += (account ? `&account=${account}` : '');
  url_params += (token ? `&token=${token}` : '');


  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>
          <img
            alt=""
            src={`${process.env.PUBLIC_URL}/favicon.ico`}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          {' Lens' }
        </Navbar.Brand>
        <Nav className="mr-auto">
          <Link className="nav-link" to={`/${APP_NAME}?page=rich_list${url_params}`}>Rich List</Link>
          <Link className="nav-link" to={`/${APP_NAME}?page=open_order${url_params}`}>Open Orders</Link>
          <Link className="nav-link" to={`/${APP_NAME}?page=trade_history${url_params}`}>Trade History</Link>
          <Link className="nav-link" to={`/${APP_NAME}?page=transfer${url_params}`}>Transfers</Link>
          <Link className="nav-link" to={`/${APP_NAME}?page=delegation${url_params}`}>Delegations</Link>
        </Nav>
      </Navbar>
      <br />

      <Body token={token} account={account} />
    </div>
  );
}

const RichList = ({token, account}) => {
  const acc = account ? "@" + account : null;
  let subject = [acc, token].filter(s => !!s).join(" ");
  subject += account ? " Token Summary" : " Rich List";

  return ( <Container>
    <Row>
      <Col>
        <h3>{subject}</h3>
        <RichListTable token={token} account={account} index="effectiveStake" descending={true}/>
      </Col>
    </Row>
  </Container> );
}

const OpenOrder = ({token, account}) => {
  return ( <Container>
    { account
        ? <Row>
            <Col>
              <h3>@{account} Buying Orders</h3>
              <TradeTable token={token} account={account} table="buyBook" index="timestamp" descending={true} />
            </Col>
            <Col>
              <h3>@{account} Selling Orders</h3>
              <TradeTable token={token} account={account} table="sellBook" index="timestamp" descending={true} />
            </Col>
          </Row>
        : <Row>
            <Col>
              <h3>People Buying {token}</h3>
              <TradeTable token={token} table="buyBook" index="price" descending={true} />
            </Col>
            <Col>
              <h3>People Selling {token}</h3>
              <TradeTable token={token} table="sellBook" index="price" descending={false} />
            </Col>
          </Row>
    }
  </Container> );
}

const TradeHistory = ({token, account}) => {
  const acc = account ? "@" + account : null;
  const subject = [acc, token].filter(s => !!s).join(" ");

  return ( <Container>
    <Row>
      {
        account ? "" : <Col>
          <h3>{subject} Trade History in 24 Hours</h3>
          <TradeTable token={token} account={account} table="tradesHistory" index="timestamp" descending={false} />
          <br /> <br />
        </Col>
      }
      <Col>
        <h3>All {subject} Trade History with Buyers and Sellers</h3>
        <TradeHistoryTable token={token} account={account} index="timestamp" descending={false}/>
      </Col>
    </Row>
  </Container> );
}

const Transfers = ({token, account}) => {
  return ( <Container>
    { account
        ? <div>
            <Row>
              <Col>
                <h3>@{account} Transfers In</h3>
                <TransferTable token={token} account={account} type="to" index="timestamp" descending={true} />
              </Col>
            </Row>
            <hr />
            <Row>
              <Col>
                <h3>@{account} Transfers Out</h3>
                <TransferTable token={token} account={account} type="from" index="timestamp" descending={true} />
              </Col>
            </Row>
          </div>
        : <div />
    }
  </Container> );
}

const Delegations = ({token, account}) => {
  return ( <Container>
    { account
        ? <div>
            <Row>
              <Col>
                <h3>@{account} Delegations In</h3>
                <DelegationTable token={token} account={account} type="to" index="timestamp" descending={true} />
              </Col>
              <Col>
                <h3>@{account} Delegations Out</h3>
                <DelegationTable token={token} account={account} type="from" index="timestamp" descending={true} />
              </Col>
            </Row>
            <hr />
            <Row>
              <Col>
                <h3>@{account} Delegations In History</h3>
                <DelegationHistoryTable token={token} account={account} type="to" index="timestamp" descending={true} />
              </Col>
              <Col>
                <h3>@{account} Delegations Out History</h3>
                <DelegationHistoryTable token={token} account={account} type="from" index="timestamp" descending={true} />
              </Col>
            </Row>
          </div>
        : <div />
    }
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
