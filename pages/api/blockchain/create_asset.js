export default function handler(req, res) {
    if (req.method === 'POST') {
      const {new_env, creator_user_id, creator_username, creator_name, creator_metamask_id, associated_project_name, associated_project_url, asset_name, asset_type, asset_description, asset_file, asset_terms, asset_image, hidden, private, multi_nft, asset_price, request_approval, r, s, v
      } = req.body;
      if (new_env === null || 
        creator_user_id === null || 
        creator_username === null || 
        creator_name === null ||  
        creator_metamask_id === null || 
        asset_name === null || 
        asset_type === null || 
        asset_description === null || 
        asset_file === null || 
        asset_image === null || 
        hidden === null || 
        private === null || 
        multi_nft === null || 
        asset_price === null ||
        request_approval === null) {
        res.status(400).json({ msg: 'Bad request' });
      }
      res.status(200).json({msg: "Success" })
    }else{
        res.status(400).json({ msg: 'Bad request' });
    }
  
    // res.status(200).json({name: "John Doe" })
  
}