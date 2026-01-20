import { Request, Response } from 'express';
import { FaucetService } from '../services/faucet.service';

export class AdminController {
    private faucetService: FaucetService;

    constructor() {
        this.faucetService = new FaucetService();
    }

    processFaucet = async (req: Request, res: Response) => {
        // Validation: Check for a secret header key for basic security
        const apiKey = req.headers['x-admin-key'];
        if (apiKey !== process.env.ADMIN_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Trigger Async
        this.faucetService.processPendingClaims().catch(err => console.error(err));

        return res.json({ message: 'Faucet processing triggered' });
    }
}
