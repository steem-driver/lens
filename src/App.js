import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import TradeTable from './TradeTable';
import { Container, Row, Col } from 'react-bootstrap';


function App({ location }) {
  const url = "https://api.steem-engine.com/rpc/contracts";
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const order_columns = [{
      Header: 'Account',
      accessor: 'account'
    }, {
      Header: 'Price (Steem)',
      accessor: 'price'
    }, {
      Header: `${token} Amount`,
      accessor: 'quantity'
    }, {
      Header: "Steem Amount",
      accessor: 'base_amount'
    }, {
      Header: "Date",
      accessor: "timestamp"
    }];

  const history_columns = [{
      Header: 'Type',
      accessor: 'type'
    }, {
      Header: 'Price (Steem)',
      accessor: 'price',
    }, {
      Header: `${token} Amount`,
      accessor: 'quantity'
    }, {
      Header: "Steem Amount",
      accessor: 'base_amount'
    }, {
      Header: "Date",
      accessor: "timestamp"
    }];


  return (
    <div>
      <h2>
        { token } Market
      </h2>
      <br />

      <Container>
        <Row>
          <Col>
            <h3>People Buying {token}</h3>
            <TradeTable url={url} token={token} table="buyBook" index="price" columns={order_columns} descending={true} />
          </Col>
          <Col>
            <h3>People Selling {token}</h3>
            <TradeTable url={url} token={token} table="sellBook" index="price" columns={order_columns} descending={false} />
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>{token} Trade History</h3>
            <TradeTable url={url} token={token} table="tradesHistory" index="timestamp" columns={history_columns} descending={false} />
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
