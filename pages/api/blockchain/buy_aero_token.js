import {ethers} from 'ethers';
import { aeroSwapInstance,provider } from '../../../helpers/contractInstance/aeroSwapInstance';

export default async function handler(req,res){
    if(req.method === 'POST'){
        //Check if data is present
        const numberOfTokens = req.body.numberOfTokens;
        const userAddress = req.body.userAddress;
        console.log("numberOfTokens", numberOfTokens)
        console.log("userAddress", userAddress)
        if(numberOfTokens === undefined ||numberOfTokens === ''|| numberOfTokens === 0){
            res.status(400).json({success: false, msg: 'Number of tokens is required.'});
            return;
        }
        //connect to user wallet
        // console.log("before web3model")
        // const web3Modal = new Web3Modal();
        // console.log("After web3model")
        // const connection = await web3Modal.connect();
        // const provider = new ethers.providers.Web3Provider(connection);
        // const signer = provider.getSigner();
        
        const feePercent = 3;
        const tokenPrice = 0.0168;

        //Set up contract instance 
       // const aeroSwapContract = new ethers.Contract(aeroSwapAddress,aeroSwapAbi.abi,signer);
        
        //Calculating total fee amount to pay
        const numberOfTokensinNum = Number(numberOfTokens)
        const numberOftokensinWei = ethers.utils.parseEther(String(numberOfTokens))
        const totalfee = (numberOfTokensinNum * feePercent)/100;
        const totalAmount = (numberOfTokensinNum - totalfee) * tokenPrice
        const totalAmountinWei = ethers.utils.parseEther(String(totalAmount))

        //Buy tokens
        try{
           const tx = await aeroSwapInstance.functions.buyTokens(numberOftokensinWei,{
            value: totalAmountinWei,
            gasLimit: 5000000
           })
           await tx.wait();
           res.status(200).json({success: true, msg:'Transaction Successful.'})
        }
        catch(error){
            console.log(error);
            res.status(500).json({success: false, msg:'Transaction Failed. Please try again.'})
        }
    }else{
        res.status(400).json({success: false, msg: 'Bad request.'})
    }
}