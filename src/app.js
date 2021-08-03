/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

import MonthlyActiveDevCount from './component/MonthlyActiveDevCount';
import ActiveAccounts from './component/ActiveAccounts';
import ActiveValidators from './component/ActiveValidators';
import NetworkStats from './component/NetworkStats';
import GithubStats from './component/GithubStats';
import Community from './component/Community';
import DepositAmount from './component/DepositAmount';
import TransactionsAmount from './component/TransactionsAmount';
import NewAccounts from './component/NewAccounts';
import FirstDappTotalCount from './component/FirstDappTotalCount';
import FirstDappDailyTotal from './component/FirstDappDailyTotal';
import Guilds from './component/Guilds';

import './app.css';

export default () => {
  return (
    <Container>
      <h1 style={{ fontWeight: '900' }}>Ecosystem Leaderboard</h1>
      <Container>
        <Row noGutters className="pl-10 pr-3 ml-3 mb-3">
          <NetworkStats />
        </Row>
        <Row noGutters className="pl-10 pr-3 ml-3">
          <Col md="4" xs="12">
            <ActiveValidators />
          </Col>
          <Col>
            <Guilds />
          </Col>
          <Col>
            <Community />
          </Col>
        </Row>

        <hr />
        <FirstDappTotalCount />
        <hr />
        <FirstDappDailyTotal />
        <hr />
        <MonthlyActiveDevCount />
        <hr />
        <GithubStats />
        <hr />
        <ActiveAccounts />
        <hr />
        <NewAccounts />
        <hr />
        <DepositAmount />
        <hr />
        <TransactionsAmount />
      </Container>
    </Container>
  );
};
