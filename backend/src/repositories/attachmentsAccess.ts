import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { Logger } from 'winston';
import { config } from "../utils/config";
import { createLogger } from '../utils/logger';

export class AttachmentsAccess {
    private readonly XAWS: AWSXRay;
    private readonly bucketName: string;
    private readonly urlExpiration: number;
    private readonly s3: AWS.S3;
    private readonly logger: Logger;

    constructor() {
        this.XAWS = AWSXRay.captureAWS(AWS);
        this.logger = createLogger('Attachent Access');
        this.bucketName = config.ATTACHMENT_S3_BUCKET;
        this.urlExpiration = parseInt(config.URL_EXPIRATION);
        this.s3 = new this.XAWS.S3({
            signatureVersion: 'v4'
        });
    }

    /** Create a presigned url of the attachments s3 bucket. */
    createAttachmentPresignedUrl = (todoId: string): string => {
        this.logger.info('Getting a signed url.');
        try {
            return this.s3.getSignedUrl("putObject", {
                Bucket: this.bucketName,
                Key: todoId,
                Expires: this.urlExpiration
            });
        } catch (error) {
            this.logger.error('Something went wrong.', {
                error
            });
        }
    };
}