import React from "react";
import { sum } from 'lodash';


export const Sum = ({column}) => {
  const value = sum(column).toFixed(3);
  return <span title={value}>
    <strong>Sum:</strong>{" "}
    { value }
  </span>
};


export const Count =  ({column}) =>  {
  const value = column.length;
  return <span title={value}>
    <strong>Count:</strong>{" "}
    { value }
  </span>
}
