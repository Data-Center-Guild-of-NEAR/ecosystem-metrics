/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";
import { Spinner, Row, Tabs, Tab } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";

import StatsApi from "../explorer-api/stats";
import Tooltip from "../utils/Tooltip";
import { term } from "../utils/term";
import { Diff } from "./MonthlyActiveDevCount";

export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activetAccounts, setAccounts] = useState([]);
  const [date, setDate] = useState([]);
  const [weeklyAccounts, setAccountsWeek] = useState([])
  const [week, setWeek] = useState([])

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
      }
    }).catch(err => {
      setError(err);
    })
    new StatsApi().activeAccountsCountAggregatedByWeek().then((accounts) => {
      if(accounts){
        const weekAccounts = accounts.map((account) => account.accountsCount)
        const week = accounts.map((account) =>account.date.slice(0, 10))
        setAccountsWeek(weekAccounts)
        setWeek(week)
      }
    }).catch(err => {
      setError(err);
    })
    setIsLoaded(true)

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
          name: "Active Accounts",
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
  const currentAccounts = Number(activetAccounts[activetAccounts.length-1])
  const prevAccounts = Number(activetAccounts[activetAccounts.length-8])
  const currentWeekly = Number(weeklyAccounts[weeklyAccounts.length -1])
  const prevWeekly = Number(weeklyAccounts[weeklyAccounts.length - 2])
  return (
    <div>
      <h3>Daily Active Accounts <Tooltip text={term.current_active_accounts} /> : <strong className="green">{currentAccounts}</strong>
          {prevAccounts && <Diff current={currentAccounts} prev={prevAccounts} />}
      </h3>
      <h3>Weekly Active Accounts <Tooltip text={term.weekly_active_accounts} /> : <strong className="green">{currentWeekly}</strong>
          {prevWeekly && <Diff current={currentWeekly} prev={prevWeekly} />} 
      </h3>
      <Tabs defaultActiveKey="daily" id="activeAccounts">
        <Tab eventKey="daily" title="Daily">
          <ReactEcharts
                  option={getOption(
                    "Daily Active Accounts",
                    date,
                    activetAccounts
                  )}
                  style={chartStyle}
                />
        </Tab>
        <Tab eventKey="weekly" title="Weekly">
        <ReactEcharts
                  option={getOption(
                    "Weekly Active Accounts",
                    week,
                    weeklyAccounts
                  )}
                  style={chartStyle}
                />
        </Tab>
      </Tabs>
    </div>
    )
}