import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';


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
    const { url, token, table, columns, index, descending } = this.props;

    return <ReactTable
      columns={columns}
      data={this.state.data} // should default to []
      pageSize={50}
      loading={this.state.loading}
      // manual // informs React Table that you'll be handling sorting and pagination server-side
      onFetchData={(state, instance) => {
        // show the loading overlay
        this.setState({loading: true});
        // fetch your data
        axios.post(url, {
          "jsonrpc":"2.0",
          "id":18,
          "method":"find",
          "params": {
            "contract":"market",
            "table": table,
            "query": { "symbol": token },
            "limit": 500,
            "offset": 0,
            "indexes":[{"index":index, "descending": descending}]
          }
        })
          .then((res) => {
            if (res && res.data && res.data.result) {
              const result = res.data.result.map(tx => {
                tx['base_amount'] = Number(tx['price'] * tx['quantity']).toFixed(3);
                tx['quantity'] = Number(tx['quantity']).toFixed(3);
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
      }}
    />
  }
}




