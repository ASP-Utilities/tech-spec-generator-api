import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * Google Secrets Manager Service
 * 
 * Manages secure access to secrets stored in Google Cloud Secret Manager.
 * Used in production to retrieve database credentials and API keys.
 * 
 * In local development, secrets are loaded from .env file instead.
 */

class SecretsService {
  private client: SecretManagerServiceClient | null = null;
  private secretsCache: Map<string, string> = new Map();
  private isProduction: boolean;
  private projectId: string | undefined;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.projectId = process.env.GCP_PROJECT_ID;

    // Only initialize Secret Manager client in production
    if (this.isProduction) {
      try {
        this.client = new SecretManagerServiceClient();
        console.log('🔐 Google Secret Manager initialized');
      } catch (error) {
        console.error('Failed to initialize Secret Manager:', error);
      }
    }
  }

  /**
   * Get a secret value by name
   * @param secretName - Name of the secret (e.g., 'DATABASE_URL')
   * @param version - Version of the secret (default: 'latest')
   */
  async getSecret(secretName: string, version: string = 'latest'): Promise<string | null> {
    // In development, get from environment variables
    if (!this.isProduction) {
      const value = process.env[secretName];
      if (!value) {
        console.warn(`⚠️ Secret '${secretName}' not found in environment variables`);
      }
      return value || null;
    }

    // Check cache first
    const cacheKey = `${secretName}:${version}`;
    if (this.secretsCache.has(cacheKey)) {
      return this.secretsCache.get(cacheKey)!;
    }

    // Retrieve from Secret Manager
    if (!this.client || !this.projectId) {
      console.error('Secret Manager client not initialized or project ID missing');
      return null;
    }

    try {
      const secretPath = `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;
      const [accessResponse] = await this.client.accessSecretVersion({
        name: secretPath,
      });

      const secretValue = accessResponse.payload?.data?.toString();
      if (secretValue) {
        // Cache the secret
        this.secretsCache.set(cacheKey, secretValue);
        console.log(`✅ Retrieved secret: ${secretName}`);
        return secretValue;
      }

      return null;
    } catch (error) {
      console.error(`Failed to retrieve secret '${secretName}':`, error);
      return null;
    }
  }

  /**
   * Get multiple secrets at once
   * @param secretNames - Array of secret names
   */
  async getSecrets(secretNames: string[]): Promise<Record<string, string | null>> {
    const secrets: Record<string, string | null> = {};
    
    await Promise.all(
      secretNames.map(async (name) => {
        secrets[name] = await this.getSecret(name);
      })
    );

    return secrets;
  }

  /**
   * Clear the secrets cache
   */
  clearCache(): void {
    this.secretsCache.clear();
    console.log('🧹 Secrets cache cleared');
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      environment: this.isProduction ? 'production' : 'development',
      clientInitialized: this.client !== null,
      projectId: this.projectId || 'not set',
      cachedSecrets: this.secretsCache.size,
    };
  }
}

// Export singleton instance
export const secretsService = new SecretsService();
export default secretsService;

