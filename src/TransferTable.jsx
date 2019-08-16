import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const text = props => <span title={props.value}>{props.value}</span>;

export default class TransferTable extends React.Component {

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

    const transfers_in_columns = [{
      Header: "Date",
      accessor: "timestamp",
      Cell: text
    }, {
      Header: account ? 'Token' : 'Account',
      accessor: account ? 'symbol' : 'account'
    }, {
      Header: "From",
      accessor: 'from'
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity'
    },  {
      Header: 'Memo',
      accessor: 'memo',
      Cell: text
    }];

    const transfers_out_columns = [{
      Header: "Date",
      accessor: "timestamp",
      Cell: text
    }, {
      Header: account ? 'Token' : 'Account',
      accessor: account ? 'symbol' : 'account'
    }, {
      Header: "To",
      accessor: 'to'
    }, {
      Header: account ? 'Amount' : `${token} Amount`,
      accessor: 'quantity'
    },  {
      Header: 'Memo',
      accessor: 'memo',
      Cell: text
    }];

    if (type === "to")
      return transfers_in_columns;
    else if (type === "from")
      return transfers_out_columns;
    else
      return null;
  }

  fetchData(offset) {
    const { token, account, type } = this.props;

    if (type !== "from" && type !== "to")
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
        console.log("res", res);
        if (res && res.data && res.data.length > 0) {
          this.fetchData(offset+limit);
          const rows = res.data.filter(tx => {
            if (tx['operation'] === 'tokens_transfer') {
              if (account && tx[type] === account)
                return true;
            }
            return false;
          }).map(tx => {
            for (let key of ["quantity"]) {
              if (typeof tx[key] !== typeof undefined && tx[key] != null)
                tx[key] = Number(tx[key])
            }
            tx['quantity'] = Number(Number(tx['quantity']).toFixed(3));
            if (tx['timestamp']) {
              tx['timestamp'] = new Date(tx['timestamp'] * 1000).toLocaleString();
            }
            return tx;
          })

          console.log("rows", rows);

          const data = this.state.data.concat(rows);
          // update table
          this.setState({
            data: data,
            loading: false
          })
        }
      })
  }
}




