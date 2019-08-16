import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Sum } from './Footer'

const text = props => <span title={props.value}>{props.value}</span>;
const column = (data, index) => data.map(row => row[index]);

export default class TradeHistoryTableNew extends React.Component {

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
          this.fetchData(0);
        }
      }}
    />
  }

  columns() {
    const { token, account, table, type } = this.props;
    const { data } = this.state;

    const buy_order_columns = [{
      Header: "Date",
      accessor: "timestamp",
      Cell: text
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
      accessor: 'price',
      Cell: text
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

    let trade_history_columns = [{
      Header: 'Buyer',
      accessor: 'buyer'
    }, {
      Header: 'Seller',
      accessor: 'seller'
    }, {
      Header: 'Price (Steem)',
      accessor: 'price',
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity',
      Footer: token ? <Sum column={column(data, "quantity")} /> : null
    }, {
      Header: "Steem Amount",
      accessor: 'volume',
      Footer: <Sum column={column(data, "volume")} />
    }, {
      Header: "Date",
      accessor: "timestamp",
      Cell: text
    }];

    if (account) {
      if (type === "buy")
        trade_history_columns.splice(0, 1);
      else if (type === "sell")
        trade_history_columns.splice(1, 1);
      trade_history_columns.splice(1, 0, {
        Header: 'Token',
        accessor: 'symbol'
      })
    }

    if (table === "order") {
      if (type === "buy")
        return buy_order_columns;
      else if (type === "sell")
        return sell_order_columns;
    } else if (table === "trade") {
      return trade_history_columns;
    }
    else
      return null;
  }

  fetchData(offset) {
    const { token, account, table, type } = this.props;

    if (type !== "buy" && type !== "sell")
        return ;

    let operation = '';
    if (table === "order") {
      operation = "market_placeOrder";
    } else if (table === "trade") {
      if (type === "buy")
        operation = "market_buy"
      else if (type === "sell")
        operation = "market_sell"
      else
        return ;
    } else
      return ;

    const limit = 500;
    let params = '';
    if (token)
      params += `&symbol=${token}`
    if (account)
      params += `&account=${account}`
    const url = `https://api.steem-engine.com/history/accountHistory?offset=${offset}&limit=${limit}${params}`;

    // fetch your data
    axios.get(url)
      .then((res) => {
        if (res && res.data) {
          if (res.data.length > 0) {
            this.fetchData(offset+limit);
            const rows = res.data.filter(tx => {
              if (tx['operation'] === operation) {
                if (tx['operation'] === "market_placeOrder") {
                  if (tx['orderType'] === type) {
                    return true;
                  }
                } else
                  return true;
              }
              return false;
            }).map(tx => {
              for (let key of ["price", "quantityLocked", "quantityTokens", "quantitySteem"]) {
                if (typeof tx[key] !== typeof undefined && tx[key] != null)
                  tx[key] = Number(tx[key])
              }
              tx['quantity'] = tx['quantityLocked'] || tx['quantityTokens'];
              if (tx['price']) {
                tx['volume'] = Number(tx['price'] * tx['quantity']);
              } else {
                tx['volume'] = tx['quantitySteem'];
                tx['price'] = Number(tx['volume'] / tx['quantity']);
              }
              tx['volume'] = Number(Number(tx['volume']).toFixed(3));
              tx['quantity'] = Number(Number(tx['quantity']).toFixed(3));
              tx['price'] = Number(Number(tx['price']).toFixed(5));
              if (tx['timestamp']) {
                tx['timestamp'] = new Date(tx['timestamp'] * 1000).toLocaleString();
              }
              if (table === "trade") {
                if (tx['from']) {
                  tx["buyer"] = tx["account"];
                  tx["seller"] = tx["from"];
                } else if (tx['to']) {
                  tx["buyer"] = tx["to"];
                  tx["seller"] = tx["account"];
                }
              }
              return tx;
            })

            const data = this.state.data.concat(rows);
            // update table
            this.setState({
              data: data,
              loading: false
            })
          } else {
            this.setState({
              loading: false
            })
          }
        }
      })
  }
}




