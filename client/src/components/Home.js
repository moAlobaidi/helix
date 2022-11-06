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
    <div style={{backgroundColor: 'midnightblue', width: "100vw", height: "100vh", display: "flex", flexDirection: 'column', justifyContent: "center"}}>
      <div className="sr-main">
        <div className="button thingy"> 
          <div style={{display: 'flex', justifyContent: 'center', width: '93%', marginTop: "80px"}}>
            <ConnectButton style={{}}/> 
          </div>
          <section className="container" style={{backgroundColor: 'white', marginTop: 30, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'}}>
            <div style={{backgroundColor: 'white'}}>
              <h1 style={{color: 'midnightblue', textAlign:'center'}}>Input your NFT</h1>
            </div>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            style={{ marginTop: 7}}/>
            <input
              type="text"
              value={tokenID}
              onChange={(e) => setTokenID(e.target.value)}
              style={{ marginTop: 10}}/>
            <button role="link" onClick={handleSubmit} style={{backgroundColor: 'midnightblue', color: 'white'}}>
              Submit
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;