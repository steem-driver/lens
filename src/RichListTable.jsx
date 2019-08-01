import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
// import { NumberRangeColumnFilter } from './Filter'

const url = "https://api.steem-engine.com/rpc/contracts";

export default class RichList extends React.Component {

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
      pageSize={100}
      // filterable={true}
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
    return [{
        Header: "#",
        id: "row",
        maxWidth: 50,
        filterable: false,
        sortable: false,
        Cell: (row) => {
          return <div>{row.page * row.pageSize + row.viewIndex + 1}</div>;
        }
      },{
        Header: "Account",
        accessor: "account"
      }, {
        Header: "Balance",
        accessor: "balance",
      }, {
        Header: "Staked",
        accessor: "stake"
      }, {
        Header: "Pending Unstake",
        accessor: "pendingUnstake"
      }, {
        Header: "Delegation In",
        accessor: "delegationsIn"
      }, {
        Header: "Delegations Out",
        accessor: "delegationsOut"
      },  {
        Header: "Effective Stake",
        accessor: "effectiveStake"
      }, {
        Header: "Balance + Staked",
        accessor: "totalAsset"
      }, {
        Header: "Total Holding",
        accessor: "totalHolding",
        // Filter: NumberRangeColumnFilter,
        // filter: 'between'
      }];
  }

  fetchData(offset) {
    const { token, index, descending } = this.props;
    const contract = "tokens";
    const table = "balances";
    const limit = 1000;

    // fetch your data
    axios.post(url, {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "find",
      "params": {
        "contract": contract,
        "table": table,
        "query": { "symbol": token },
        "limit": limit,
        "offset": offset,
        // "indexes":[{"index":index, "descending": descending}]
      }
    })
      .then((res) => {
        if (res && res.data && res.data.result) {
          if (res.data.result.length > 0) {
            this.fetchData(offset + limit);

            const result = res.data.result.map(tx => {
              for (let key of ["balance", "stake", "pendingUnstake", "delegationsIn", "delegationsOut"]) {
                if (typeof tx[key] !== typeof undefined && tx[key] != null) {
                  tx[key] = Number(tx[key])
                } else {
                  tx[key] = 0
                }
              }
              tx['delegationsIn'] = tx['delegationsIn'] || tx['receivedStake'] || 0;
              tx['delegationsOut'] = tx['delegationsOut'] || tx['delegatedStake'] || 0;
              tx['effectiveStake'] = Number(tx['stake']) + Number(tx['delegationsIn']);
              tx['totalAsset'] = Number(tx['balance']) + Number(tx['stake']);
              tx['totalHolding'] = tx['totalAsset'] + tx['delegationsIn']

              return tx;
            }).filter(tx => tx['totalHolding'] > 0) // filter out that holds no token

            // sort by index column
            const order = descending ? -1 : 1;
            let data = this.state.data.concat(result);
            data.sort((a, b) => ((a[index] - b[index]) * order));

            // update table
            this.setState({
              data: data,
              loading: false
            });
          }
        }
      })
  }
}




