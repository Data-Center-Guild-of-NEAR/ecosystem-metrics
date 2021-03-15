/* eslint-disable import/no-anonymous-default-export */
import React, { useState, useEffect } from "react";
import { Spinner, Row } from "react-bootstrap";
import ReactEcharts from "echarts-for-react";
import BN from "bn.js"
import { NEAR_NOMINATION } from "near-api-js/lib/utils/format";

import StatsApi from "../explorer-api/stats";
import Tooltip from "../utils/Tooltip";
import { term } from "../utils/term";
import { Diff } from "./MonthlyActiveDevCount";
import { formatWithCommas } from "../utils/convert";

export default () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deposit, setDeposit] = useState([]);
  const [date, setDate] = useState([]);

  useEffect(() => {
    new StatsApi().depositAmountAggregatedByDate().then((depositList) => {
      if (depositList) {
        const deposit = depositList.map(
          (account) => new BN(account.depositAmount).div(new BN(NEAR_NOMINATION)).toString()
        );
        const date = depositList.map((account) =>
          account.date.slice(0, 10)
        );
        setDeposit(deposit);
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
  const currentDeposit = Number(deposit[deposit.length-1])
  const prevDeposit = Number(deposit[deposit.length-8])
  return (
    <div>
      <h3>Daily Deposit Transacted <Tooltip text={term.total_deposit} /> : <strong className="green">{formatWithCommas(currentDeposit)} Ⓝ</strong>
          {prevDeposit && <Diff current={currentDeposit} prev={prevDeposit} />}
      </h3>
      <ReactEcharts
              option={getOption(
                "Daily Amount of Deposit transacted",
                date,
                deposit
              )}
              style={chartStyle}
            />
    </div>
    )
}