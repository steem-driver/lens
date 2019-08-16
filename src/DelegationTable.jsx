import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const url = "https://api.steem-engine.com/rpc/contracts";
const text = props => <span title={props.value}>{props.value}</span>;

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
          this.fetchData(0);
        }
      }}
    />
  }

  columns() {
    const { token, account, type } = this.props;

    const delegation_in_columns = [{
      Header: account ? 'Token' : 'Account',
      accessor: account ? 'symbol' : 'account'
    }, {
      Header: "From",
      accessor: 'from'
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity'
    }, {
      Header: "Created",
      accessor: "created",
      Cell: text
    }, {
      Header: "Updated",
      accessor: "updated",
      Cell: text
    }];

    const delegation_out_columns = [{
      Header: account ? 'Token' : 'Account',
      accessor: account ? 'symbol' : 'account'
    }, {
      Header: "To",
      accessor: 'to'
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity'
    }, {
      Header: "Created",
      accessor: "created",
      Cell: text
    }, {
      Header: "Updated",
      accessor: "updated",
      Cell: text
    }];

    if (type === "to")
      return delegation_in_columns;
    else if (type === "from")
      return delegation_out_columns;
    else
      return null;
  }

  fetchData(offset) {
    const { token, account, index, descending, type } = this.props;
    const contract = "tokens";
    const table = "delegations";
    const limit = 500;
    const query = {}
    if (token)
      query['symbol'] = token;
    if (account)
      query[type] = account;

    // fetch your data
    axios.post(url, {
      "jsonrpc":"2.0",
      "id":1,
      "method":"find",
      "params": {
        "contract": contract,
        "table": table,
        "query": query,
        "limit": limit,
        "offset": offset,
        "indexes":[{"index":index, "descending": descending}]
      }
    })
      .then((res) => {
        if (res && res.data && res.data.result) {
          if (res.data.result.length > 0) {
            this.fetchData(offset+limit);
            const rows = res.data.result.map(tx => {
              for (let key of ["quantity"]) {
                if (typeof tx[key] !== typeof undefined && tx[key] != null)
                  tx[key] = Number(tx[key])
              }
              tx['quantity'] = Number(Number(tx['quantity']).toFixed(3));
              if (tx['created']) {
                tx['created'] = new Date(tx['created']).toLocaleString();
              }
              if (tx['updated']) {
                tx['updated'] = new Date(tx['updated']).toLocaleString();
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




