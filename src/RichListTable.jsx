import React from "react";
import axios from 'axios';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
// import { NumberRangeColumnFilter } from './Filter'
import { Sum, Count } from './Footer'

const url = "https://api.steem-engine.com/rpc/contracts";

const column = (data, index) => data.map(row => row[index]);
const number = props => <span>{props.value.toFixed(3)}</span>;

export default class RichList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      data: [],
      pages: -1,
      loading: true
    }
    this.data = [];
  }

  render() {
    const { index, descending } = this.props;

    return <ReactTable
      className="-highlight -striped"
      columns={this.columns()}
      data={this.state.data} // should default to []
      pageSize={100}
      defaultSorted={[
        {
          id: index,
          desc: descending
        }
      ]}
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
    const { data } = this.state;

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
        accessor: "account",
        Footer: <Count column={column(data, "account")} />,
      }, {
        Header: "Balance",
        accessor: "balance",
        Footer: <Sum column={column(data, "balance")} />,
      }, {
        Header: "Staked",
        accessor: "stake",
        Footer: <Sum column={column(data, "stake")} />,
      }, {
        Header: "Pending Unstake",
        accessor: "pendingUnstake",
        Footer: <Sum column={column(data, "pendingUnstake")} />,
      }, {
        Header: "Delegation In",
        accessor: "delegationsIn",
        Footer: <Sum column={column(data, "delegationsIn")} />,
      }, {
        Header: "Delegations Out",
        accessor: "delegationsOut",
        Footer: <Sum column={column(data, "delegationsOut")} />,
      },  {
        Header: "Effective Stake",
        accessor: "effectiveStake",
        Cell: number,
        Footer: <Sum column={column(data, "effectiveStake")} />,
      }, {
        Header: "Balance + Staked",
        accessor: "totalAsset",
        Cell: number,
        Footer: <Sum column={column(data, "totalAsset")} />,
      }, {
        Header: "Total Holding",
        accessor: "totalHolding",
        Cell: number,
        Footer: <Sum column={column(data, "totalHolding")} />,
        // Filter: NumberRangeColumnFilter,
        // filter: 'between'
      }];
  }

  fetchData(offset) {
    const { token } = this.props;
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
              for (let key of ["balance", "stake", "pendingUnstake", "delegationsIn", "delegationsOut", "receivedStake", "delegatedStake"]) {
                if (typeof tx[key] !== typeof undefined && tx[key] != null) {
                  tx[key] = Number(tx[key])
                } else {
                  tx[key] = 0
                }
              }
              tx['delegationsIn'] = tx['delegationsIn'] || tx['receivedStake'] || 0;
              tx['delegationsOut'] = tx['delegationsOut'] || tx['delegatedStake'] || 0;
              tx['effectiveStake'] = tx['stake'] + tx['delegationsIn'];
              tx['totalAsset'] = tx['balance'] + tx['stake'];
              tx['totalHolding'] = tx['totalAsset'] + tx['delegationsIn'];

              return tx;
            }).filter(tx => tx['totalHolding'] > 0) // filter out that holds no token

            this.data = this.data.concat(result);
          } else {
            // update table
            this.setState({
              data: this.data,
              loading: false
            });
          }
        }
      })
  }
}




