/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";
import { Spinner, Row, Tabs, Tab } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";

import StatsApi from "../explorer-api/stats";
import Tooltip from "../utils/Tooltip";
import { term } from "../utils/term";
import { Diff } from "./MonthlyActiveDevCount";
import {cumulativeSumArray} from "../utils/convert";

export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState([]);
  const [cumulativeTransactionsByDate, setTotal] = useState([]);

  useEffect(() => {
    new StatsApi().transactionsAggregatedByDate().then((transactionList) => {
      if (transactionList) {
        const transactions = transactionList.map(
          (account) => Number(account.transactionsCount)
        );
        const date = transactionList.map((account) =>
          account.date.slice(0, 10)
        );
        const totalTransactionByDate = cumulativeSumArray(transactions);
        setTransactions(transactions);
        setTotal(totalTransactionByDate);
        setDate(date);
        setIsLoaded(true)
      }
    }).catch(err => {
      setIsLoaded(true)
      setError(err);
    });
  }, []);

  const chartStyle = {
    height: "480px",
    width: "90%"
  };

  const getOption = (title, date, data) => {
    return {
      title: {
        text: title,
      },
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
        show: true,
        color: "gray",
        backgroundColor: "rgba(218, 210, 250, 0.1)",
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: date,
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            lineStyle: {
              color: "white",
            },
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          filterMode: "filter",
        },
        {
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: "Daily Transactions",
          type: "line",
          lineStyle: {
            color: "#4f44e0",
            width: 2,
          },
          symbol: "circle",
          itemStyle: {
            color: "#25272A",
          },
          data: data,
        },
      ],
    };
  };

  if (error) {
    return <Row>Error: {error.message}</Row>;
  } else if (!isLoaded || date.length === 0) {
    return <Row>
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="primary" />
          </Row>;;
  } 
  const currentTxs = Number(transactions[transactions.length-1])
  const prevTxs = Number(transactions[transactions.length-8])
  return (
    <div>
      <h3>Daily Amount of Transactions<Tooltip text={term.transaction_count} /> : <strong className="green">{currentTxs}</strong>
          {prevTxs && <Diff current={currentTxs} prev={prevTxs} />}
      </h3>
      <Tabs defaultActiveKey="daily" id="transactionByDate">
        <Tab eventKey="daily" title="Daily">
          <ReactEcharts
                  option={getOption(
                    "Daily Number of Transactions",
                    date,
                    transactions
                  )}
                  style={chartStyle}
          />
        </Tab>
        <Tab eventKey="total" title="Total">
          <ReactEcharts
                  option={getOption(
                    "Total Number of Transactions",
                    date,
                    cumulativeTransactionsByDate
                  )}
                  style={chartStyle}
          />
        </Tab>
      </Tabs>
      
    </div>
    )
}