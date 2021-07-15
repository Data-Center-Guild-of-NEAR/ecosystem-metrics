/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

import MonthlyActiveDevCount from './component/MonthlyActiveDevCount';
import ActiveAccounts from './component/ActiveAccounts';
import ActiveValidators from './component/ActiveValidators';
import NetworkStats from './component/NetworkStats';
import GithubStats from './component/GithubStats';
import Partner from './component/Partner';
import DepositAmount from './component/DepositAmount';
import TransactionsAmount from './component/TransactionsAmount';
import NewAccounts from './component/NewAccounts';

import './app.css';

export default () => {
  return (
    <Container>
      <h1 style={{ fontWeight: '900' }}>Ecosystem Metrics</h1>
      <Container>
        <Row noGutters className="pl-10 pr-3">
          <Col>
            <ActiveValidators />
          </Col>
          <Col>
            <Partner />
          </Col>
        </Row>
        <Row noGutters>
          <NetworkStats />
        </Row>

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
