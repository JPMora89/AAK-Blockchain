export default function handler(req, res) {
    if (req.method === 'POST') {
        const {
            new_env,
            buyer_user_id,
            buyer_username,
            buyer_name,
            buyer_metamask_id,
            project_owner_metamask_id,
            asset_id,
            asset_file,
            r,
            s,
            v 
        } = req.body;  
        if(
            new_env == null ||
            buyer_user_id == null ||
            buyer_username == null ||
            buyer_name == null ||
            buyer_metamask_id == null ||
            project_owner_metamask_id == null ||
            asset_id == null ||
            asset_file == null ||
            r == null ||
            s == null ||
            v == null
        ){
            res.status(400).json({ msg: 'Bad request' });
        }
        res.status(200).json({msg: "Success" })
    }
    res.status(400).json({ msg: 'Bad request' });
}