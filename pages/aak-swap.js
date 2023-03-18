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
  const [numberOfTokens, setNumberOfTokens] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successColor, setSuccessColor] = useState('green');
  const [errorColor, setErrorColor] = useState('red');
  const [status, setStatus] = useState(false)
  const [totalAmount, setTotalAmount]=useState();
  const contractAddress = aeroSwapAddress;
  const [feePercent, setFeePercent] = useState();
  const [tokenRecived, setTokenReceived] = useState()
   
  useEffect(() => {
    getInitialInfo();
  }, []);

  useEffect(()=>{
    handleTotalAmount();
  },[numberOfTokens])

  //getting information from contract
  const getInitialInfo=async()=>{
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const aeroSwapContract = new ethers.Contract(contractAddress, AeroSwapABI.abi, signer)
    
    aeroSwapContract.tokenPrice()
       .then(price => {
        const val= ethers.utils.formatEther(price)
        setTokenPrice(Number(val))
      });
      
    aeroSwapContract.tokensSold()
       .then(sold => {
        setTokensSold(ethers.utils.formatEther(sold))});
    aeroSwapContract.feePercent()
    .then(feePercent =>{ 
      setFeePercent(Number(feePercent.toString()))})
      
  }
  
  //handle token buying 
  const handleBuyToken = async()=> {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    await window.ethereum.enable();

    const aeroSwapcontract = new ethers.Contract(contractAddress, AeroSwapABI.abi, signer)

    const tokenAddress = aeroAddress;
    const token = new ethers.Contract(tokenAddress, TokenAbi.abi, signer);
    if(numberOfTokens == '' || numberOfTokens == undefined){
      setErrorMessage('Please enter the number of Aero Tokens.');
    }else{
      const numberOfTokensinNum = Number(numberOfTokens)
      const numberOftokensinWei = ethers.utils.parseEther(String(numberOfTokens))
      console.log(numberOftokensinWei.toString())
       const totalfee = (numberOfTokensinNum * feePercent)/100;
       //const totalAmount = numberOfTokens*tokenPrice*(1+ (feePercent /100))
      const totalAmount = (numberOfTokensinNum - totalfee) * tokenPrice
      const totalAmountinWei = ethers.utils.parseEther(String(totalAmount))
      console.log(totalAmountinWei.toString())

      try{
        const gasPrice = await provider.getGasPrice();
         
       const tx = await aeroSwapcontract.buyTokens(numberOftokensinWei,{
        value: totalAmountinWei ,
        gasLimit: 5000000
      });
        
        await tx.wait(); 
        setSuccessMessage('Transaction successful!');
        //window.location.reload(false);
      }
      catch(error){
           console.log(error);
           setErrorMessage('Transaction failed. Please try again.');
      }
    
  }
    
  };

  //runs when the token Amount changes
  const handleTotalAmount=async(e)=>{

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const gasPrice = await provider.getGasPrice();
    const gas = ethers.utils.formatEther( gasPrice)
    const totalfee = (numberOfTokens * feePercent)/100;
    const ttlcost = ((tokenPrice + totalfee) * numberOfTokens) + (gas * 5000000);
    
    //Gas Price * Gas Limit + (Number of Tokens * Token Price)
      const tokenAmountinNum = Number(numberOfTokens)
      const tokenPriceinNum = Number(tokenPrice)
      const gasLimit = ethers.utils.parseEther(String(5000000)).toString()
    //number of tokens
      const tokensReceive = numberOfTokens - totalfee;
      setTokenReceived(tokensReceive)
      if(numberOfTokens == ''||numberOfTokens == undefined){
        setTokenReceived(0)
      }else{
        setTokenReceived(tokensReceive)
      }

      const totalAmount = (((tokenAmountinNum - totalfee)*tokenPriceinNum)).toFixed(6)
      //console.log("gasLimit",(ethers.utils.formatEther(gasPrice)))
      if(numberOfTokens == ''||numberOfTokens == undefined){
        setTotalAmount(0.00000)
      }else{
        setTotalAmount(ttlcost.toFixed(6))
      }
     
  }

  return (
    <div>
      <div className="flex justify-center" style={{marginBottom:'-6%'}}>
        <div className="w-1/2 flex flex-col pb-12">
          <h1
            className="py-10 text-3xl flex "
            style={{ color: "#3079AB", alignSelf: "flex-start" }}
          >
            Buy Aero Tokens
          </h1>
          <div className="flex justify-center">
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>1.68 ETH = 100 AER</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Tokens Sold: {tokensSold}</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Fee Percent: {feePercent}%</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Tokens you receive: {tokenRecived} AER</p>
          </div>
          <input value={numberOfTokens} className="mt-2 border rounded p-4" placeholder="Number of Aero coins" onChange={(e)=>setNumberOfTokens(e.target.value)} />
          <p>Your total value: {totalAmount} approx(*May vary based on the network traffic)</p>
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
      <div className="mt-2 border rounded p-4" style={{border:'solid black 3px',margin:'1% 25%', width:'50%',padding:'3%',}}>
          <h2><b>Know the process:</b></h2><br/>
          <p>
            * Please ensure your wallet is connected before making a purchase.<br/>
            * Token value and our 3% fee are clearly stated on the page.<br/>
            * How Fee works :<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We charge a 3% fee on token purchases, which means if you buy 1<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;token, 3% of it will be taken as a fee, resulting in you receiving only 0.97 tokens. Please <br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;review the 'tokens you receive' field before completing your purchase.<br/>
            * Please ensure you have enough ETH in your wallet to complete the transaction; otherwise, it may fail.<br/>
            * Note that the transaction price may vary based on the gas price and network traffic.<br/>
          </p>
      </div>
    </div>
  );
}

