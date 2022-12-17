import { Logger } from "winston";
import { AttachmentsAccess } from "../repositories/attachmentsAccess";
import { createLogger } from "../utils/logger";

export class AttachmentService {
    private readonly attachmentsAccess: AttachmentsAccess;
    private readonly logger: Logger;

    constructor() {
        this.attachmentsAccess = new AttachmentsAccess();
        this.logger = createLogger('Attachment Service');
    }

    /**
     * Delete an attachment from an S3 bucket.
     * @param s3Key Location and Name of the attachment.
     * @returns True if delete successfully, false if not.
     */
    async deleteAttachmentAsync(s3Key: string): Promise<boolean> {
        this.logger.info('Start deleting an attachment.', {
            s3Key
        });

        return await this.attachmentsAccess.deleteAttachment(s3Key);
    }

    /**
     * Check for an attachment existence.
     * @param s3Key Location and Name of the attachment.
     * @returns True if exists, false if not.
     */
    async isAttachmentExists(s3Key: string): Promise<boolean> {
        this.logger.info('Calling attachment checking repo.', {
            s3Key
        });

        const objectExist = await this.attachmentsAccess.isObjectExist(s3Key);

        if (!objectExist) {
            this.logger.info('Attachment doesn\'t exists!');
            return false;
        }

        return objectExist;
    }
}