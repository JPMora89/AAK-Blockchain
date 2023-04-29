import Web3Modal from 'web3modal';
import {ethers} from 'ethers'
import { useState,useEffect,useRef } from 'react';
import { aeroSwapUsdAddress } from '../config';
import aeroSwapUsdAbi from '../artifacts/contracts/Aero-swap-usd.sol/AeroSwapUsd.json';

export default function Success(){
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successColor, setSuccessColor] = useState('green');
    const [errorColor, setErrorColor] = useState('red');
    const dataFetchedRef = useRef(false);

    useEffect(()=>{
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const tokenCount = urlParams.get('quantity')
        
        buyAeroWithUsd(tokenCount)
    },[])

    const buyAeroWithUsd=async(numberOfTokens)=>{
        const numberOfTokensInWei = ethers.utils.parseEther(String(numberOfTokens))
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const aeroSwapUsdInstance = new ethers.Contract(aeroSwapUsdAddress, aeroSwapUsdAbi.abi,signer)
       try{
         const tx = await aeroSwapUsdInstance.buyTokens(numberOfTokensInWei, {
            gasLimit: 5000000
          });
        await tx.wait();
        setSuccessMessage('Transaction successful!');
        window.location.href = "http://localhost:3000/aak-swap"
       }
       catch(err){
         console.log(err)
         setErrorMessage('Transaction failed. Please try again.');
       }

    }


    return(
        <>
         
        <div className="mt-2 border rounded p-4" style={{ border: 'solid black 3px', margin: '1% 15%', width: '70%', padding: '3%', }}>
            <h1 style={{color: 'green'}}><b>SUCCESS</b></h1>
            <p>Your payment was successful .<br/> We are now transfering the token to your wallet, This might take few min<br/> PLEASE DONOT REFRESH THE PAGE</p>
        </div>
        <div className="w-1/2 flex flex-col pb-12" style={{ margin: "2% 15%" }}>
            {successMessage && (
              <p style={{ color: successColor }}>{successMessage}</p>
            )}
            {errorMessage && (
              <p style={{ color: errorColor }}>{errorMessage}</p>
            )}
        </div>
        </>
    )
}