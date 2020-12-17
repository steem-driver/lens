import React from "react";
import axios from 'axios';
import DelegationTable from './DelegationTable';

const text = props => <span title={props.value}>{props.value}</span>;

export default class DelegationHistoryTable extends DelegationTable {

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
      Header: "Date",
      accessor: "timestamp",
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
      Header: "Date",
      accessor: "timestamp",
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
    const { token, account, type } = this.props;

    if (type !== "from" && type !== "to")
        return ;

    const limit = 500;
    let params = '';
    if (token)
      params += `&symbol=${token}`
    if (account)
      params += `&account=${account}`
    const url = `https://api.steem-engine.net/history/accountHistory?offset=${offset}&limit=${limit}${params}`;

    // fetch your data
    axios.get(url)
      .then((res) => {
        if (res && res.data) {
          if (res.data.length > 0) {
            this.fetchData(offset+limit);
            const rows = res.data.filter(tx => {
              if (tx['operation'] === 'tokens_delegate') {
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




