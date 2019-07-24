import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const cors_proxy = 'https://cors-anywhere.herokuapp.com/';

export default class TradeHistoryTable extends React.Component {

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
          this.fetchData(state, instance);
        }
      }}
    />
  }

  columns() {
    const { token } = this.props;

    return [{
      Header: 'Type',
      accessor: 'type'
    }, {
      Header: 'Buyer',
      accessor: 'buyer'
    }, {
      Header: 'Seller',
      accessor: 'seller'
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
  }

  fetchData(state, instance) {
    const { token } = this.props;
    const contract = "market";
    const pageSize = 1000;
    const page = 1;
    const url = `https://steem-engine.rocks/transactions.json?symbol=${token}&contract=${contract}&per_page=${pageSize}&page=${page}`;

    // fetch your data
    axios.get(`${cors_proxy}${url}`)
      .then((res) => {
        if (res && res.data && res.data.transactions) {
          let result = [];
          for (let tx of res.data.transactions) {
            const rows = this.buildRows(tx);
            if (rows != null) {
              if (rows.length > 0) {
                result = result.concat(rows);
              } else {
                result.push(rows);
              }
            }
          }
          // update table
          this.setState({
            data: result,
            loading: false
          })
        }
      })
  }

  buildRows(tx) {
    const { token } = this.props;

    if (tx['payload']['symbol'] !== token)
      return null;
    if (tx['action'] !== "buy" && tx['action'] !== "sell")
      return null;

    const events = tx['logs']['events'];
    let transactions = events.filter(e => (e['event'] === "transferFromContract"));
    if (!transactions || transactions.length === 0) {
      return null;
    } else {
      // price: Number(tx['payload']['price']),
      // quantity: Number(tx['payload']['quantity']),
      // row['volume'] = Number(row['price'] * row['quantity']).toFixed(3)
      let rows = [];
      for (let index = 0 ; index + 1 < transactions.length; index += 2) {
        // console.log("transaction", transactions[index], transactions[index+1]);
        const sender = tx['sender'];
        const { receiver, quantity, volume } = this.getTradeInfo(sender, token, [transactions[index], transactions[index+1]]);

        const row = {
          type: tx['action'],
          timestamp: new Date(tx['timestamp']).toLocaleString(),
          price: Number(Number(volume / quantity).toFixed(8)),
          quantity: Number(Number(quantity).toFixed(3)),
          volume: Number(Number(volume).toFixed(3))
        }

        if (row['type'] === "buy") {
          row['buyer'] = sender;
          row['seller'] = receiver;
        } else if (row['type'] === "sell") {
          row['seller'] = sender;
          row['buyer'] = receiver;
        }

        rows.push(row);
      }
      return rows;
    }
  }

  getTradeInfo(sender, token, events) {
    let receiver = null, quantity = null, volume = null;
    for (const e of events) {
      const data = e['data'];
      if (data['to'] !== sender)
        receiver = data['to'];
      if (data['symbol'] === token)
        quantity = data['quantity'];
      else if (data['symbol'] === "STEEMP")
        volume = data['quantity'];
    }
    return { receiver, quantity, volume };
  }
}
