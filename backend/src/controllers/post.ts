import { Request, Response } from 'express'

const getPosts = async (req: Request, res: Response) => {
    return res.status(200).send([])
}

export default {
    getPosts
}
