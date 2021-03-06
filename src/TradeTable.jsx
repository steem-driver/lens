import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const url = "https://api.steem-engine.net/rpc2/contracts";

export default class TradeTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      data: [],
      pages: -1,
      loading: true
    }
  }

  render() {
    return <ReactTable
      className="-highlight -striped"
      columns={this.columns()}
      data={this.state.data} // should default to []
      pageSize={20}
      loading={this.state.loading}
      // manual // informs React Table that you'll be handling sorting and pagination server-side
      onFetchData={(state, instance) => {
        if (state.data.length === 0) {
          // show the loading overlay
          this.setState({loading: true});
          this.fetchData();
        }
      }}
    />
  }

  columns() {
    const { token, account, table } = this.props;

    const buy_order_columns = [{
      Header: "Date",
      accessor: "timestamp"
    }, {
      Header: account ? 'Token' : 'Account',
      accessor: account ? 'symbol' : 'account'
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity'
    }, {
      Header: "Steem Amount",
      accessor: 'volume'
    }, {
      Header: 'Price (Steem)',
      accessor: 'price'
    }];

    const sell_order_columns = [{
      Header: 'Price (Steem)',
      accessor: 'price'
    }, {
      Header: "Steem Amount",
      accessor: 'volume'
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity'
    }, {
      Header: account ? 'Token' : 'Account',
      accessor: account ? 'symbol' : 'account'
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
      accessor: 'volume'
    }, {
      Header: "Date",
      accessor: "timestamp"
    }];

    if (table === "tradesHistory")
      return history_columns;
    else if (table === "buyBook")
      return buy_order_columns;
    else if (table === "sellBook")
      return sell_order_columns;
    else
      return null;
  }

  fetchData() {
    const { token, account, table, index, descending } = this.props;
    const contract = "market";
    const query = {}
    if (token)
      query['symbol'] = token;
    if (account)
      query['account'] = account;

    // fetch your data
    axios.post(url, {
      "jsonrpc":"2.0",
      "id":18,
      "method":"find",
      "params": {
        "contract": contract,
        "table": table,
        "query": query,
        "limit": 500,
        "offset": 0,
        "indexes":[{"index":index, "descending": descending}]
      }
    })
      .then((res) => {
        if (res && res.data && res.data.result) {
          const result = res.data.result.map(tx => {
            for (let key of ["quantity", "price"]) {
              if (typeof tx[key] !== typeof undefined && tx[key] != null)
                tx[key] = Number(tx[key])
            }
            if (!tx['volume']) {
               tx['volume'] = Number(tx['price'] * tx['quantity'])
            }
            tx['volume'] = Number(Number(tx['volume']).toFixed(3));
            tx['quantity'] = Number(Number(tx['quantity']).toFixed(3));
            if (tx['timestamp']) {
              tx['timestamp'] = new Date(tx['timestamp'] * 1000).toLocaleString();
            }
            return tx;
          })
          // update table
          this.setState({
            data: result,
            loading: false
          })
        }
      })
  }
}




