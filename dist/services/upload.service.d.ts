export declare class UploadService {
    static generatePresignedPutUrl(userId: string, filename: string, contentType: string): Promise<{
        url: string;
        key: string;
    }>;
    static generatePresignedGetUrl(key: string): Promise<string>;
}
//# sourceMappingURL=upload.service.d.ts.map