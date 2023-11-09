// AUCTION state does not work bcos backend does not work

import styles from "../styles/Home.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";
import Dutch_Auction from "../../BackEnd_Contract/artifacts/contracts/Dutch_Auction.sol/Dutch_Auction.json";

export default function AuctionEntrance() {
  const Address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  // These get re-rendered every time due to our connect button!
  const chainId = parseInt(chainIdHex);
  console.log(`ChainId is ${chainId}`);
  if (isWeb3Enabled) {
    const chainId = parseInt(chainIdHex, 16); // Parse the hex string to an integer
    console.log(`Chain ID: ${chainId}`);
  } else {
    console.log("Moralis is not connected to any network.");
  }
  // const auctionAddress = chainId in Address ? Address[chainId][0] : null
  // console.log(`auctionAddress is ${auctionAddress}`)
  const [auctionState, setAuctionState] = useState("");
  const [auctionOwner, setAuctionOwner] = useState("");
  const [totalAlgosAvailable, setTotalAlgosAvailable] = useState(0);
  const [changePerMin, setChangePerMin] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [isAuctionStarted, setAuctionStarted] = useState(false);
  const [isEndingAuction, setEndingAuction] = useState(false);
  const [bidValue, setBidValue] = useState(0);
  const [isBidding, setIsBidding] = useState(false);

  //20mins in seconds
  const auctionDuration = 3 * 60 * 1000;
  const dispatch = useNotification();

  function clickButton() {
    const button = document.getElementById("endButton");
    if (button) {
      button.click();
    } else {
      console.error("Button not found in the DOM.");
    }
  }

  //to start auction
  const { runContractFunction: startAuction } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "startAuction",
    params: {
      _totalAlgosAvailable: totalAlgosAvailable,
      _changePerMin: changePerMin,
    },
  });
  const handleStartAuction = async () => {
    try {
      setAuctionStarted(true); // Set the flag to true
      setTimeout(() => {
        clickButton();
      }, auctionDuration);
      const tx = await startAuction({
        onSuccess: () => {
          handleSuccess(tx);
        },
        onError: (error) => console.log(error),
      });
      console.log("Auction started successfully!!!");
      // You can also consider waiting for the transaction to be confirmed here
    } catch (error) {
      console.error("Error starting the auction:", error);
    } finally {
      setAuctionStarted(false); // Reset the flag to false
    }
  };

  const { runContractFunction: endAuction } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "endAuction",
    params: {},
  });

  /* View Functions */

  const { runContractFunction: getAuctionState } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address, // specify the networkId
    functionName: "getAuctionState",
    params: {},
  });

  const { runContractFunction: getAuctionOwner } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "retrieveContractOwner",
    params: {},
  });

  const { runContractFunction: getCurrentPrice } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address, // Specify the networkId
    functionName: "retrieveCurrentPrice",
  });

  const handleFetchPrice = async () => {
    try {
      setFetchingPrice(true);
      const currentPriceFromCall = await getCurrentPrice({});
      const currentP = currentPriceFromCall.toString();
      setCurrentPrice(currentP);
      handleNewNotification;
    } catch (error) {
      console.error("Error fetching current price:", error);
    } finally {
      setFetchingPrice(false);
    }
  };

  const { runContractFunction: addBidder } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "addBidder",
    payable: true,
    msgValue: bidValue,
  });

  const handleBid = async () => {
    try {
      setIsBidding(true);
      if (bidValue <= 0) {
        console.error("Bid value must be greater than 0");
        return;
      }
      const tx = await addBidder({
        onSuccess: () => {
          console.log("Bid added successfully!");
          handleSuccess(tx);
          // You can add additional logic here after the successful bid.
        },
        onError: (error) => console.error("Error adding bid:", error),
      });
    } catch (error) {
      console.error("Error adding bid:", error);
    } finally {
      setIsBidding(false); // Reset the bidding flag to false
    }
  };

  async function updateUIValues() {
    try {
      const auctionStateFromCall = await getAuctionState({});
      const auctionOwnerFromCall = await getAuctionOwner({});
      const mappedAuctionState = auctionStateFromCall === 0 ? "OPEN" : "CLOSED";
      setAuctionState(mappedAuctionState);
      setAuctionOwner(auctionOwnerFromCall);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      updateUIValues();
      handleNewNotification(tx);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-5">
      <div className="py-1 px-4 text-2xl">Auction State: {auctionState} </div>
      <div className="py-2 px-4 text-2xl">Auction Owner: {auctionOwner}</div>
      <div className={styles.container1}>
        <div style={{ marginBottom: "10px", marginTop: "10px" }}>
          <label>Total Algos Available:</label>
          <input
            type="number"
            value={totalAlgosAvailable}
            onChange={(e) =>
              setTotalAlgosAvailable(parseInt(e.target.value, 10))
            }
            style={{
              marginLeft: "5px",
              padding: "2px",
              width: "70px",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Change Per Min:</label>
          <input
            type="number"
            value={changePerMin}
            onChange={(e) => setChangePerMin(parseInt(e.target.value, 10))}
            style={{ marginLeft: "5px", padding: "2px", width: "70px" }}
          />
        </div>
        <button
          className={styles.customButton}
          onClick={handleStartAuction}
          disabled={isAuctionStarted}
        >
          {isAuctionStarted ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            "Start Auction"
          )}
        </button>
      </div>
      <div className={styles.container1}>
        <div style={{ marginBottom: "10px", marginTop: "10px" }}>
          <label>Bid Amount: </label>
          <input
            type="number"
            value={bidValue}
            onChange={(e) => setBidValue(parseInt(e.target.value, 10))}
            style={{
              marginLeft: "5px",
              padding: "2px",
              width: "70px",
            }}
          />
          <label style={{ marginLeft: "3px" }}>Wei</label>
        </div>
        <button
          className={styles.customButton}
          onClick={handleBid}
          disabled={isBidding}
        >
          {isBidding ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            "Bid"
          )}
        </button>
      </div>
      <div className={styles.container1}>
        <div style={{ marginBottom: "10px", marginTop: "10px" }}>
          <label>Current Price: {currentPrice} </label>
          <label style={{ marginLeft: "3px" }}>ETH</label>
        </div>
        <button
          className={styles.customButton}
          onClick={handleFetchPrice}
          disabled={fetchingPrice}
        >
          {fetchingPrice ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            "Update Current Price"
          )}
        </button>
      </div>
      <button
        id="endButton"
        className={styles.customButton}
        onClick={endAuction}
        disabled={isEndingAuction}
      >
        {isEndingAuction ? (
          <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
        ) : (
          "End Auction"
        )}
      </button>
    </div>
  );
}
