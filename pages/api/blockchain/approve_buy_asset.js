export default function handler(req, res) {
    if (req.method === 'POST') {
        const { new_env,
            user_id,
            buyer_username,
            buyer_name,
            buyer_metamask_id,
            project_owner_metamask_id,
            asset_id,
            r,
            s,
            v
        } = req.body;
        if (
            user_id === null ||
            buyer_username === null ||
            buyer_name === null ||
            buyer_metamask_id == null ||
            asset_id === null ||
            project_owner_metamask_id === null ||
            r === null ||
            s === null ||
            v === null
        ) {
            res.status(400).json({ msg: 'Bad request' });
        }
        res.status(200).json({ name: "John Doe" })
    }
    else{
        res.status(400).json({ msg: 'Bad request' });
    }
}