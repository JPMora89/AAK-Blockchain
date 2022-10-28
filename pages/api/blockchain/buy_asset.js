export default function handler(req, res) {
    if (req.method === 'POST') {
      res.status(200).json({name: "John Doe" })
    }
    res.status(400).json({ msg: 'Bad request' });
}