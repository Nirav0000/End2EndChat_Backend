import { UploadService } from '../services/upload.service.js';
export class UploadController {
    static async getPresignedUrl(req, res) {
        const { filename, contentType } = req.body;
        const data = await UploadService.generatePresignedPutUrl(req.userId, filename, contentType);
        res.json(data);
    }
    static async getFile(req, res) {
        const { key } = req.query;
        const url = await UploadService.generatePresignedGetUrl(key);
        res.json({ url });
    }
}
//# sourceMappingURL=upload.controller.js.map