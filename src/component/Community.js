import React from 'react';
import { Row, Col } from 'react-bootstrap';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
  <div style={{ textAlign: 'left' }}>
    <h4>
      <strong>Community</strong>
    </h4>
    <Row noGutters>
      <Col>
        <div>
          <a
            href="https://gov.near.org/t/near-community-mapping/3568"
            target="_blank"
            rel="noreferrer"
          >
            Comunity Mapping
          </a>
        </div>
        <div>
          <a
            href="https://gov.near.org/c/community/10"
            target="_blank"
            rel="noreferrer"
          >
            Join Comunity
          </a>
        </div>
        <div>
          <a
            href="https://gov.near.org/c/official-near-updates/8"
            target="_blank"
            rel="noreferrer"
          >
            Engineering Updates
          </a>
        </div>
        <div>
          <a href="https://nearweek.com/" target="_blank" rel="noreferrer">
            News Guild: NEAER Week
          </a>
        </div>
        <div>
          <a
            href="https://twitter.com/NEAR_daily"
            target="_blank"
            rel="noreferrer"
          >
            Daily News: @NEAR_daily
          </a>
        </div>
      </Col>
    </Row>
  </div>
);
