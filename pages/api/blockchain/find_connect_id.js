import connectSchema from './stripeConnectSch';

export default async function handler(req,res){
    const emailId = req.body;
    
    const data = await  connectSchema.find({emailId: emailId})
    const receipentId = data.map((item) => item.recipientAccountId)
    const receipentAccountId = receipentId[0]

    if(data){
        res.status(200).json({receipentAccountId})
    }else{
        res.status(500).json({ message:'EmailId doenot exists' });
    }
   
}