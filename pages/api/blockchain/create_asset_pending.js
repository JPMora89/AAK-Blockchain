export default function handler(req, res) {
    if (req.method === 'POST') {
    const {new_env, creator_user_id, creator_username, creator_name, creator_metamask_id, associated_project_name, associated_project_url, asset_name, asset_type, asset_description, asset_file, asset_terms, asset_image, hidden, private, multi_nft, asset_price
        } = req.body;
      res.status(200).json({msg: "Success" })
    }
    res.status(400).json({ msg: 'Bad request' });
}