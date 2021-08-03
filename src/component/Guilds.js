/* eslint-disable import/no-anonymous-default-export */
import React from 'react';

export default () => {
  return (
    <div style={{ textAlign: 'left' }}>
      <h4>
        <strong>Guilds and DAOs</strong>
      </h4>
      <div>
        <a href="https://nearguilds.com/" target="_blank" rel="noreferrer">
          Explore NEAR Guild
        </a>
      </div>
      <div>
        <a
          href="https://gov.near.org/c/community/guilds/18"
          target="_blank"
          rel="noreferrer"
        >
          Join Guild Program
        </a>
      </div>
      <div>
        <a
          href="https://gov.near.org/t/near-community-mapping/3568#regional-and-local-guilds-30"
          target="_blank"
          rel="noreferrer"
        >
          Regional and Local Guilds:<strong className="green">14</strong>
        </a>
      </div>
      <div>
        <a
          href="https://nearguilds.com/guilds"
          target="_blank"
          rel="noreferrer"
        >
          Global Guilds:<strong className="green">11</strong>
        </a>
      </div>
      <div>
        <a href="https://www.sputnik.fund/#/" target="_blank" rel="noreferrer">
          Explore NEAR SputnikDao
        </a>
      </div>
      <div>
        <a href="http://stats.sputnik.fund/" target="_blank" rel="noreferrer">
          Number of Dao: <strong className="green">157</strong>
        </a>
      </div>
    </div>
  );
};
