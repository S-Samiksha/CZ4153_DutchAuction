// AUCTION state does not work bcos backend does not work

import styles from "../styles/Home.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";
import { Magic } from "magic-sdk";
import Dutch_Auction from "../../BackEnd_Contract/artifacts/contracts/Dutch_Auction.sol/Dutch_Auction.json";
// import Dutch_Auction from "..constants/abi.json"

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
  // const [auctionState, setAuctionState] = useState("")
  const [auctionOwner, setAuctionOwner] = useState("");
  // const [NumAlgos, setNumAlgos] = useState("")
  const [totalAlgosAvailable, setTotalAlgosAvailable] = useState(0);
  const [changePerMin, setChangePerMin] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  const dispatch = useNotification();

  // const totalAlgosAvailable = 200
  // const changePerMin = 10
  //to start auction
  const {
    runContractFunction: startAuction,
    data: isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "startAuction",
    params: {
      _totalAlgosAvailable: totalAlgosAvailable,
      _changePerMin: changePerMin,
    },
  });

  // const handleStartAuction = async () => {
  //     // Ensure that totalAlgosAvailable and changePerMin are validated and in the right format
  //     await startAuction("200", "10", {
  //         onSuccess: handleSuccess,
  //         onError: (error) => console.log(error),
  //     })

  // }

  /* View Functions */

  // const { runContractFunction: getAuctionState } = useWeb3Contract({
  //     abi: Dutch_Auction.abi,
  //     contractAddress: Address, // specify the networkId
  //     functionName: "getAuctionState",
  //     params: {},
  // })

  const { runContractFunction: getAuctionOwner } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "retrieveContractOwner",
    params: {},
  });
  const { runContractFunction: getNumAlgos } = useWeb3Contract({
    abi: Dutch_Auction.abi,
    contractAddress: Address,
    functionName: "getTotalAlgos",
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
    } catch (error) {
      console.error("Error fetching current price:", error);
    } finally {
      setFetchingPrice(false);
    }
  };

  async function updateUIValues() {
    try {
      // const auctionStateFromCall = await getAuctionState({})
      const auctionOwnerFromCall = await getAuctionOwner({});
      // const numAlgosFromCall = await getNumAlgos()
      // const Nalgos = numAlgosFromCall.toString()
      // setAuctionState(auctionStateFromCall)
      setAuctionOwner(auctionOwnerFromCall);
      // setNumAlgos(Nalgos)
      // console.log(NumAlgos)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUIValues();
    }
  }, [isWeb3Enabled]);

  // const handleNewNotification = () => {
  //     dispatch({
  //         type: "info",
  //         message: "Transaction Complete!",
  //         title: "Transaction Notification",
  //         position: "topR",
  //         icon: "bell",
  //     })
  // }

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      updateUIValues();
      handleNewNotification(tx);
      console.log("Auction started successfully!!!");
    } catch (error) {
      console.log(error);
    }
  };

  // ----- HTML Code -----
  return (
    <div className="p-5">
      <div className="py-1 px-4 text-2xl">Auction State: </div>
      <div className="py-2 px-4 text-2xl">Auction Owner: {auctionOwner}</div>
      {/* <div className="py-2 px-4 text-2xl">Num Algos: {NumAlgos}</div> */}
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
              width: "50px",
              background: "light grey",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Change Per Min:</label>
          <input
            type="number"
            value={changePerMin}
            onChange={(e) => setChangePerMin(parseInt(e.target.value, 10))}
            style={{ marginLeft: "5px", padding: "2px", width: "50px" }}
          />
        </div>
        <button
          className={styles.customButton}
          onClick={async () =>
            await startAuction({
              // onComplete:
              // onError:
              onSuccess: handleSuccess,
              onError: (error) => console.log(error),
            })
          }
          // onClick={handleStartAuction}
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            // <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            <div className="h-8 w-8 border-b-2 rounded-full"></div>
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
            // value={totalAlgosAvailable}
            // onChange={(e) => setTotalAlgosAvailable(parseInt(e.target.value, 10))}
            style={{
              marginLeft: "5px",
              padding: "2px",
              width: "50px",
              background: "light grey",
            }}
          />
          <label style={{ marginLeft: "3px" }}>ETH</label>
        </div>
        <button
          className={styles.customButton}
          // onClick={handleStartAuction}
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
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
          disabled={fetchingPrice || isLoading || isFetching}
        >
          {fetchingPrice ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            "Update Current Price"
          )}
        </button>
      </div>
    </div>
  );
}
