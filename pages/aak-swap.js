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
  const [numberOfTokensToSell,setNumberOfTokensToSell]=useState()
  const [successMessageSell, setSuccessMessageSell] = useState(null);
  const [errorMessageSell, setErrorMessageSell] = useState(null);
  const [successColorSell, setSuccessColorSell] = useState('green');
  const [errorColorSell, setErrorColorSell] = useState('red');
  const [totalEthreceived, setTotalEthReceived] = useState();
  const[sellGasPrice,setSellGasPrice] = useState();
   
  useEffect(() => {
    getInitialInfo();
  }, []);

  useEffect(()=>{
    handleTotalAmount();
  },[numberOfTokens])

  useEffect(()=>{
    handleTotalEth();
  },[numberOfTokensToSell])

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
  
  //Function lets user buy AER token 
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
      const totalfee = (numberOfTokensinNum * feePercent)/100;
      const totalAmount = (numberOfTokensinNum - totalfee) * tokenPrice
      const totalAmountinWei = ethers.utils.parseEther(String(totalAmount))
    
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


  //Sell tokens and get eth in return

  const handleSellToken=async()=>{
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    await window.ethereum.enable();

    const aeroSwapcontract = new ethers.Contract(contractAddress, AeroSwapABI.abi, signer)
    
    if(numberOfTokensToSell == ''|| numberOfTokensToSell == undefined){
      setErrorMessageSell('Please enter the number of Aero Tokens.');
    }else{
      
          await approve() 
      
           const numberOfTokensinNum = Number(numberOfTokensToSell)
           const numberOftokensinWei = ethers.utils.parseEther(String(numberOfTokensToSell))
           const totalfee = (numberOfTokensinNum * feePercent)/100;
           const totalAmount = (numberOfTokensinNum - totalfee) * tokenPrice
           const totalAmountinWei = ethers.utils.parseEther(String(totalAmount))
          try{
            const tx = await aeroSwapcontract.sellTokens(numberOftokensinWei,{
              gasLimit: 5000000
            });
            await tx.wait(); 
            setSuccessMessageSell('Transaction successful!');
          }
        catch(error){
          console.log(error)
          setErrorMessageSell('Transaction failed. Please try again.');
        }
      
    }

  }
  
  //Approve token
  async function approve() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const tokenAddress = aeroAddress;
    const tokenContract = new ethers.Contract(tokenAddress, TokenAbi.abi, signer);
    try {
      const approveTx = await tokenContract.approve(
        aeroSwapAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
      return true
    } catch (error) {
      console.log(error);
      return false
    } 
  }
  //runs when the token Amount changes
  const handleTotalAmount=async(e)=>{

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const gasPrice = await provider.getGasPrice();
    const gas = ethers.utils.formatEther( gasPrice)
    const totalfee = (numberOfTokens * feePercent)/100;
    const ttlcost = ((tokenPrice + totalfee) * numberOfTokens) + (gas * 5000000);
    
      const tokenAmountinNum = Number(numberOfTokens)
      const tokenPriceinNum = Number(tokenPrice)
      const gasLimit = ethers.utils.parseEther(String(5000000)).toString()
      const tokensReceive = numberOfTokens - totalfee;
      setTokenReceived(tokensReceive)
      if(numberOfTokens == ''||numberOfTokens == undefined){
        setTokenReceived(0)
      }else{
        setTokenReceived(tokensReceive)
      }

      const totalAmount = (((tokenAmountinNum - totalfee)*tokenPriceinNum)).toFixed(6)
      if(numberOfTokens == ''||numberOfTokens == undefined || numberOfTokens == 0){
        setTotalAmount(0.00000)
      }else{
        setTotalAmount(ttlcost.toFixed(6))
      }
     
  }

//Handle to tal ETH amount the user receives onSelling
const handleTotalEth=async()=>{
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  const gasPrice = await provider.getGasPrice();
  const gas = Number(ethers.utils.formatEther( gasPrice))
  const totalfee = (numberOfTokensToSell * feePercent)/100;
  const total = (numberOfTokensToSell - totalfee)* tokenPrice;
  if(numberOfTokensToSell==''||numberOfTokensToSell==undefined||numberOfTokensToSell==0){
    setTotalEthReceived(0)
  }else{
    setTotalEthReceived(total.toFixed(4))
  }
}
  return (
    <div>
      <div className="flex justify-center" style={{border:'solid black 2px', width:'50%',margin:'2% 25%',borderRadius:'3em'}}>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>1.68 ETH = 100 AER</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Tokens Sold: {tokensSold}</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Fee Percent: {feePercent}%</p>
        </div>
      <div className="flex justify-center" style={{marginBottom:'-6%'}}>
        <div className="w-1/2 flex flex-col pb-12" style={{width: '30%'}}>
          <h1
            className="py-10 text-3xl flex "
            style={{ color: "#3079AB", alignSelf: "flex-start" }}
          >
            Buy Aero Tokens
          </h1>
          <div className="flex justify-center">
            {/* <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>1.68 ETH = 1 AER</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Tokens Sold: {tokensSold}</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Fee Percent: {feePercent}%</p> */}
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

        <div className="w-1/2 flex flex-col pb-12" style={{width: '30%',marginLeft:'2%'}}>
          <h1
            className="py-10 text-3xl flex "
            style={{ color: "#3079AB", alignSelf: "flex-start" }}
          >
           Sell Aero Tokens
          </h1>
          <div className="flex justify-center">
            {/* <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>1.68 ETH = 1 AER</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Tokens Sold: {tokensSold}</p>
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>Fee Percent: {feePercent}%</p> */}
            <p className="rounded mt-4 font-bold" style={{margin:'2%'}}>ETH you receive: {totalEthreceived} ETH</p>
          </div>
          <input value={numberOfTokensToSell} className="mt-2 border rounded p-4" placeholder="Number of Aero coins" onChange={(e)=>setNumberOfTokensToSell(e.target.value)} />
          <p>You will be paying the gas price and fee based on the network traffic.</p>
          <button className="font-bold text-white rounded p-4 shadow-lg" style={{ backgroundColor: "#3079AB",marginTop: "2%"}} onClick={handleSellToken}>Sell Tokens</button>
          <div className="w-1/2 flex flex-col pb-12" style={{marginTop: "2%"}}>
            {successMessageSell && (
              <p style={{ color: successColorSell }}>{successMessageSell}</p>
            )}
            {errorMessageSell && (
              <p style={{ color: errorColorSell }}>{errorMessageSell}</p>
            )}
            </div>
        </div>
      </div>
      <div className="mt-2 border rounded p-4" style={{border:'solid black 3px',margin:'1% 15%', width:'70%',padding:'3%',}}>
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
            * Add Aero Token to your wallet using the token address: 0xA7C6009E88F6054c0FDBec12e80cB2Fdb0a8d0d3.<br/>
            * While selling tokens 3% of the eth will be deducted as fee, which means for 1 AER token it is 1.68 ETH<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;after deduction of 3% you will receive 1.6296 ETH. Please review the 'Eth you receive' field.
          </p>

      </div>

    </div>
  );
}

