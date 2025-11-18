/**
 * Storage adapter interface for file uploads (avatars, attachments)
 */

export interface StorageObject {
  key: string
  url: string
  contentType?: string
  size?: number
}

export interface IStorageAdapter {
  /**
   * Upload a file
   */
  upload(
    key: string,
    data: Buffer | string,
    options?: {
      contentType?: string
      metadata?: Record<string, string>
    }
  ): Promise<StorageObject>

  /**
   * Get a file's public URL
   */
  getUrl(key: string): Promise<string>

  /**
   * Delete a file
   */
  delete(key: string): Promise<void>

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>
}

/**
 * Local filesystem storage (for development)
 */
export class LocalStorageAdapter implements IStorageAdapter {
  constructor(private basePath: string = './uploads') {}

  async upload(
    key: string,
    data: Buffer | string,
    options?: { contentType?: string }
  ): Promise<StorageObject> {
    // TODO: Implement local file storage
    console.log('[LOCAL STORAGE] Would upload:', key, options)

    return {
      key,
      url: `/uploads/${key}`,
      contentType: options?.contentType,
      size: Buffer.isBuffer(data) ? data.length : data.length,
    }
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`
  }

  async delete(key: string): Promise<void> {
    console.log('[LOCAL STORAGE] Would delete:', key)
  }

  async exists(key: string): Promise<boolean> {
    // TODO: Check filesystem
    return false
  }
}

/**
 * S3-compatible storage adapter
 */
export class S3StorageAdapter implements IStorageAdapter {
  constructor(private config: {
    bucket: string
    region: string
    accessKeyId?: string
    secretAccessKey?: string
  }) {}

  async upload(
    key: string,
    data: Buffer | string,
    options?: { contentType?: string; metadata?: Record<string, string> }
  ): Promise<StorageObject> {
    // TODO: Implement S3 upload using AWS SDK
    console.log('[S3 STORAGE] Would upload:', key, options)

    return {
      key,
      url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`,
      contentType: options?.contentType,
    }
  }

  async getUrl(key: string): Promise<string> {
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement S3 delete
    console.log('[S3 STORAGE] Would delete:', key)
  }

  async exists(key: string): Promise<boolean> {
    // TODO: Implement S3 head object
    return false
  }
}

/**
 * No-op storage adapter (for testing)
 */
export class NoOpStorageAdapter implements IStorageAdapter {
  async upload(
    key: string,
    _data: Buffer | string,
    _options?: { contentType?: string }
  ): Promise<StorageObject> {
    return {
      key,
      url: `/noop/${key}`,
    }
  }

  async getUrl(key: string): Promise<string> {
    return `/noop/${key}`
  }

  async delete(_key: string): Promise<void> {
    // Do nothing
  }

  async exists(_key: string): Promise<boolean> {
    return false
  }
}

// Export default adapter based on environment
export function createStorageAdapter(): IStorageAdapter {
  const adapterType = process.env.STORAGE_ADAPTER || 'local'

  switch (adapterType) {
    case 's3':
      return new S3StorageAdapter({
        bucket: process.env.S3_BUCKET || '',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      })

    case 'noop':
      return new NoOpStorageAdapter()

    case 'local':
    default:
      return new LocalStorageAdapter(process.env.UPLOAD_PATH)
  }
}
