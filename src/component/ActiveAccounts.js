/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";
import { Spinner, Row } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";

import StatsApi from "../explorer-api/stats";
import Tooltip from "../utils/Tooltip";
import {term} from "../utils/term";

export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activetAccounts, setAccounts] = useState([]);
  const [date, setDate] = useState([]);

  useEffect(() => {
    new StatsApi().activeAccountsCountAggregatedByDate().then((accounts) => {
      if (accounts) {
        const newAccounts = accounts.map(
          (account) => account.accountsCount
        );
        const date = accounts.map((account) =>
          account.date.slice(0, 10)
        );
        setAccounts(newAccounts);
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
    width: "100%"
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
          name: "Daily Developer",
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
  return (
    <div>
      <h3>Daily Active Accounts <Tooltip text={term.current_active_accounts} /> : <strong className="green">{activetAccounts[activetAccounts.length-1]}</strong></h3>
      <ReactEcharts
              option={getOption(
                "Daily Amount of Active Accounts",
                date,
                activetAccounts
              )}
              style={chartStyle}
            />
    </div>
    )
}