export default function handler(req, res) {
    if (req.method === 'GET') {
        const { asset_id } = req.query;
        if(asset_id === null){
            res.status(400).json({msg: 'Bad request'});
        }
        res.status(200).json({name: "John Doe"})
    }
    else{
        res.status(400).json({msg: 'Bad request'});
    }
}