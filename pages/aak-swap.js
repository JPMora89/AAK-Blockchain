import { useState, useEffect } from 'react';
import Web3 from 'web3';
import AeroSwapABI from '../artifacts/contracts/Aero-swap.sol/AeroSwap.json';
import TokenAbi from '../artifacts/contracts/v2/Aero.sol/Aero.json';
import {ethers} from 'ethers';
import Web3Modal from 'web3modal';
import { aeroAddress, aeroSwapAddress } from '../config';

const web3 = new Web3(Web3.givenProvider);

export default function AeroSwap() {
  const [tokenPrice, setTokenPrice] = useState(null);
  const [tokensSold, setTokensSold] = useState(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successColor, setSuccessColor] = useState('green');
  const [errorColor, setErrorColor] = useState('red');
  const [status, setStatus] = useState(false)
  const [totalAmount, setTotalAmount]=useState();
  const contractAddress = aeroSwapAddress;
  const [feePercent, setFeePercent] = useState();
  

   
  useEffect(() => {
    getInitialInfo();
  }, []);

  useEffect(()=>{
    handleTotalAmount();
  },[tokenAmount])

  const getInitialInfo=async()=>{
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const aeroSwapContract = new ethers.Contract(contractAddress, AeroSwapABI.abi, signer)
    console.log("contract" , contractAddress)
   
    aeroSwapContract.tokenPrice()
       .then(price => {
        setTokenPrice(ethers.utils.formatEther(price))
      });
    aeroSwapContract.tokensSold()
       .then(sold => setTokensSold(parseInt(sold, 16)));
    aeroSwapContract.feePercent()
    .then(feePercent =>{ 
      setFeePercent(feePercent.toString())})
  }
  console.log("token price", feePercent)
  const handleBuyToken = async()=> {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    await window.ethereum.enable();

    const aeroSwapcontract = new ethers.Contract(contractAddress, AeroSwapABI.abi, signer)

    const tokenAddress = aeroAddress;
    const token = new ethers.Contract(tokenAddress, TokenAbi.abi, signer);
    if(tokenAmount == '' || tokenAmount == undefined){
      setErrorMessage('Please enter the number of Aero Tokens.');
    }else{
      const totalfee = (tokenAmount * feePercent)/100;
      const tokenAmountinNum = Number(tokenAmount)
      const tokenPriceinNum = Number(tokenPrice)
      const totalAmount = (tokenAmountinNum + totalfee)*tokenPriceinNum
      
      const ttlAmt =ethers.utils.parseEther(String(totalAmount))
      console.log("totalAmoun",totalAmount)
      const tokAmt = ethers.utils.parseEther(String(tokenAmount))
      console.log("tokAmt",tokAmt)
      try{
        const gasPrice = await provider.getGasPrice();
        console.log("gas Price", gasPrice)
        console.log();
        //const gasLimit = await aeroSwapcontract.estimateGas.buyTokens(tokenAmount, { value: amountInBigNUm });
       // console.log("gasLimit",gasLimit)
        
        const tx = await aeroSwapcontract.buyTokens(tokAmt,{
          value: ttlAmt ,
          gasPrice: gasPrice,
          gasLimit: 5000000
        });
        
        // await tx.wait();
        setSuccessMessage('Transaction successful!');
      }
      catch(error){
           console.log(error);
           setErrorMessage('Transaction failed. Please try again.');
      }
    
  }
    
  };

  const handleTotalAmount=(e)=>{
    const totalfee = (tokenAmount * feePercent)/100;
      const tokenAmountinNum = Number(tokenAmount)
      const tokenPriceinNum = Number(tokenPrice)
      const totalAmount = (tokenAmountinNum + totalfee)*tokenPriceinNum
      setTotalAmount(totalAmount)
  }

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
          <h1
            className="py-10 text-3xl flex "
            style={{ color: "#3079AB", alignSelf: "flex-start" }}
          >
            Buy Aero Tokens
          </h1>
          <p className="rounded mt-4 font-bold">1ETH = 100 AER</p>
          <p className="rounded mt-4 font-bold">Token Price: ${tokenPrice}</p>
          <p className="rounded mt-4 font-bold">Tokens Sold: {tokensSold}</p>
          <p className="rounded mt-4 font-bold">Fee Percent: {feePercent}%</p>
          <input value={tokenAmount} className="mt-2 border rounded p-4" placeholder="Number of Aero coins" onChange={(e)=>setTokenAmount(e.target.value)} />
          <p>Your total value: {totalAmount} + gas Price</p>
          <button className="font-bold text-white rounded p-4 shadow-lg" style={{ backgroundColor: "#3079AB",marginTop: "2%"}} onClick={handleBuyToken}>Buy Tokens</button>
          <div className="w-1/2 flex flex-col pb-12" style={{marginTop: "2%"}}>
            {successMessage && (
              <p style={{ color: successColor }}>{successMessage}</p>
            )}
            {errorMessage && (
              <p style={{ color: errorColor }}>{errorMessage}</p>
            )}
        </div>
        </div>
      </div>
    </div>
  );
}

