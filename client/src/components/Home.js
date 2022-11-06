import React, { useState } from "react";
import {useHistory} from "react-router-dom";
import {ConnectButton} from "@rainbow-me/rainbowkit";

const Home = () => {
  const [tokenAddress, setTokenAddress] = useState(
    "0x99a9b7c1116f9ceeb1652de04d5969cce509b069"
  );
  const [tokenID, setTokenID] = useState("381000225");
  const history = useHistory();

  function handleSubmit() {
    history.push('/checkout?tokenID=' + encodeURIComponent(tokenID)
      + '&tokenAddress=' + encodeURIComponent(tokenAddress));
  }

  return (
    <div className="sr-root">
      <div className="sr-main">
        <ConnectButton />
        <section className="container">
          <div>
            <h1>Input your NFT</h1>
          </div>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          <input
            type="text"
            value={tokenID}
            onChange={(e) => setTokenID(e.target.value)}
          />
          <button role="link" onClick={handleSubmit}>
            Submit
          </button>
        </section>
      </div>
    </div>
  );
};

export default Home;