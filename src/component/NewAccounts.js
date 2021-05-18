/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";
import { Spinner, Row, Tabs, Tab } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";

import StatsApi from "../explorer-api/stats";
import Tooltip from "../utils/Tooltip";
import { term } from "../utils/term";
import { Diff } from "./MonthlyActiveDevCount";
import { cumulativeSumArray} from "../utils/convert"

export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newAccounts, setAccounts] = useState([]);
  const [date, setDate] = useState([]);
  const [cumulativeNewAccountsByDate, setTotal] = useState([]);

  useEffect(() => {
    new StatsApi().newAccountsCountAggregatedByDate().then((accounts) => {
      if (accounts) {
        const newAccounts = accounts.map(
          (account) => Number(account.accountsCount)
        );
        const date = accounts.map((account) =>
          account.date.slice(0, 10)
        );
        setAccounts(newAccounts);
        setTotal(cumulativeSumArray(newAccounts));
        setDate(date);
        setIsLoaded(true)
      }
    }).catch(err => {
      setError(err);
      setIsLoaded(true)
    })

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
          name: "New Accounts",
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
  const currentAccounts = Number(newAccounts[newAccounts.length-1])
  const prevAccounts = Number(newAccounts[newAccounts.length-8])
  return (
    <div>
      <h3>Daily Number of New Accounts<Tooltip text={term.new_account_count} /> : <strong className="green">{currentAccounts}</strong>
          {prevAccounts && <Diff current={currentAccounts} prev={prevAccounts} />}
      </h3>
      <Tabs defaultActiveKey="daily" id="activeAccounts">
        <Tab eventKey="daily" title="Daily">
          <ReactEcharts
                  option={getOption(
                    "Daily Active Accounts",
                    date,
                    newAccounts
                  )}
                  style={chartStyle}
                />
        </Tab>
        <Tab eventKey="total" title="Total">
          <ReactEcharts
                    option={getOption(
                      "Total Amount of New Accounts",
                      date,
                      cumulativeNewAccountsByDate
                    )}
                    style={chartStyle}
          />
        </Tab>
      </Tabs>
    </div>
    )
}