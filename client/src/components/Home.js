import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as url from "url";
import Triangle from "triangle";
import { useAccount } from "wagmi";

const triangle = new Triangle("");

const createVault = async (name) => {
  /*Creates a vault that contains 1 wallet and returns wallet POST response*/
  const vault = await triangle.vaults.create({
    name: "My Vault",
  });
  const wallet = await triangle.wallets.create({
    name: "My Ethereum Wallet",
    network: "ethereum_goerli",
    vault: vault.id,
  });
  return wallet;
};
/*const createWallet = async (userVault) => {
    const vault = await triangle.vaults.retrieve(
        userVault.id
    );
}*/

const Home = () => {
  const [tokenURL, setTokenURL] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const { isConnected } = useAccount();
  const history = useHistory();
  const getAddressAndIdFromURL = (url) => {
    //https://testnets.opensea.io/assets/goerli/0x3a1e7aba44bf21a66344d7a0f795a7df0b49ed60/30536
    const partsArray = url.split("/");
    const tokenAddress = partsArray[5];
    const tokenID = partsArray[6];
    return { tokenAddress: tokenAddress, tokenID: tokenID };
  };
  function handleCreateTriangleWallet() {
    const userWallet = createVault(name);
    if (!userWallet) {
      console.log("couldn't create wallet");
      return;
    }
    setAddress(userWallet.address);
  }

  function handleSubmit() {
    const { tokenAddress, tokenID } = getAddressAndIdFromURL(tokenURL);
    if (!address && !isConnected) {
      console.log("fuck off");
      return;
    }
    history.push(
      "/checkout?tokenID=" +
        encodeURIComponent(tokenID) +
        "&tokenAddress=" +
        encodeURIComponent(tokenAddress) +
        `${address ?? "&userAddress=" + encodeURIComponent(address)}`
    );
  }

  return (
    <div
      style={{
        backgroundColor: "midnightblue",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <section
          className="container"
          style={{
            backgroundColor: "white",
            marginTop: 30,
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          }}
        >
          <div style={{ backgroundColor: "white" }}>
            <h1 style={{ color: "midnightblue", textAlign: "center" }}>
              Create Triangle Wallet
            </h1>
          </div>
          <input
            type="text"
            placeholder={"What's your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginTop: 7 }}
          />
          <button
            role="link"
            onClick={handleCreateTriangleWallet}
            style={{ backgroundColor: "midnightblue", color: "white" }}
          >
            Create Wallet
          </button>
        </section>
        <div className="sr-main">
          <div className={"button thingy"}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "93%",
                marginTop: "80px",
              }}
            >
              <ConnectButton />
            </div>
            <section
              className="container"
              style={{
                backgroundColor: "white",
                marginTop: 30,
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              }}
            >
              <div style={{ backgroundColor: "white" }}>
                <h1 style={{ color: "midnightblue", textAlign: "center" }}>
                  Input your NFT
                </h1>
              </div>
              <input
                type="text"
                placeholder={"OpenSea link"}
                value={tokenURL}
                onChange={(e) => setTokenURL(e.target.value)}
                style={{ marginTop: 7 }}
              />
              <button
                role="link"
                onClick={handleSubmit}
                style={{ backgroundColor: "midnightblue", color: "white" }}
              >
                Submit
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
