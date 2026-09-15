/**
 * API Service for Backend Integration
 * Handles all communication with the quickstart CAP backend
 */

// Types for API responses
export interface User {
  ID: string;
  username: string;
}

export interface Tag {
  code: string;
  label: string;
  description: string;
}

export interface DocumentContributor {
  user: User;
  accessLevel: 'VIEW';
}

export interface DocumentTag {
  tag: Tag;
}

export interface DocumentAsset {
  ID: string;
  mediaType: string;
  filename: string;
  content?: string;
}

export interface Document {
  ID: string;
  title: string;
  description: string | null;
  parent_ID: string | null;
  editorState: string;
  author: User;
  contributors: DocumentContributor[];
  tags: DocumentTag[];
  assets?: DocumentAsset[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  parentId?: string | null;
  tags?: string[];
  contributorsUsernames?: string[];
  editorState?: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(token: string): HeadersInit {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Document Service (OData)
  private get documentServiceUrl(): string {
    return `${this.baseUrl}/quickstart/document-service`;
  }

  // ==================== Documents ====================

  /**
   * Get all documents for the current user
   */
  async getDocuments(token: string): Promise<Document[]> {
    const response = await fetch(`${this.documentServiceUrl}/Documents?$expand=author,contributors($expand=user),tags($expand=tag)`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  }

  /**
   * Get a single document by ID
   */
  async getDocument(token: string, documentId: string): Promise<Document> {
    const response = await fetch(
      `${this.documentServiceUrl}/Documents(${documentId})?$expand=author,contributors($expand=user),tags($expand=tag),assets`,
      { headers: this.getAuthHeaders(token) }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new document
   */
  async createDocument(token: string, payload: CreateDocumentPayload): Promise<Document> {
    const response = await fetch(`${this.documentServiceUrl}/createNewDocument`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to create document');
    }

    return response.json();
  }

  /**
   * Update document editor state
   */
  async updateDocument(token: string, documentId: string, updates: Partial<Document>): Promise<void> {
    const response = await fetch(`${this.documentServiceUrl}/Documents(${documentId})`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(token: string, documentId: string): Promise<void> {
    const response = await fetch(`${this.documentServiceUrl}/Documents(${documentId})`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  /**
   * Set document contributors
   */
  async setDocumentContributors(token: string, documentId: string, contributorsUsernames: string[]): Promise<Document> {
    const response = await fetch(`${this.documentServiceUrl}/setDocumentContributors`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ documentId, contributorsUsernames }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set contributors: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set document tags
   */
  async setDocumentTags(token: string, documentId: string, tags: string[]): Promise<Document> {
    const response = await fetch(`${this.documentServiceUrl}/setDocumentTags`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ documentId, tags }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set tags: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== Assets ====================

  /**
   * Upload an asset (image, diagram, etc.)
   */
  async uploadAsset(
    token: string,
    documentId: string,
    file: File
  ): Promise<DocumentAsset> {
    // Read file as base64
    const content = await this.fileToBase64(file);

    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({
        document_ID: documentId,
        mediaType: file.type,
        filename: file.name,
        content,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to upload asset');
    }

    return response.json();
  }

  /**
   * Get asset with content
   * Try multiple approaches since CAP handles LargeBinary differently
   */
  async getAssetWithContent(token: string, assetId: string): Promise<DocumentAsset & { content: string }> {
    // First try to get content directly in JSON response
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    const asset = await response.json();
    console.log('[API] getAssetWithContent response:', {
      id: asset.ID,
      mediaType: asset.mediaType,
      hasContent: !!asset.content,
      contentType: typeof asset.content,
      contentLength: asset.content?.length
    });

    // If content is already in the response, return it
    if (asset.content) {
      return asset;
    }

    // Otherwise try the /content endpoint
    const contentResponse = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})/content`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (contentResponse.ok) {
      const blob = await contentResponse.blob();
      const base64 = await this.blobToBase64(blob);
      return { ...asset, content: base64 };
    }

    throw new Error('Could not retrieve asset content');
  }

  /**
   * Get asset metadata
   */
  async getAsset(token: string, assetId: string): Promise<DocumentAsset> {
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get asset content (binary data as base64)
   * CAP/OData serves LargeBinary via /content endpoint
   */
  async getAssetContent(token: string, assetId: string): Promise<{ content: string; mediaType: string }> {
    // First get metadata for mediaType
    const metadata = await this.getAsset(token, assetId);

    // Then fetch the binary content via content endpoint
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})/content`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch asset content: ${response.statusText}`);
    }

    // Convert blob to base64
    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);

    return {
      content: base64,
      mediaType: metadata.mediaType,
    };
  }

  /**
   * Get asset content as text (for XML/text files like drawio)
   */
  async getAssetContentAsText(token: string, assetId: string): Promise<string> {
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})/content`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch asset content: ${response.statusText}`);
    }

    return response.text();
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get pure base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Delete an asset
   */
  async deleteAsset(token: string, assetId: string): Promise<void> {
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete asset: ${response.statusText}`);
    }
  }

  // ==================== Tags ====================

  /**
   * Get all available tags
   */
  async getTags(token: string): Promise<Tag[]> {
    const response = await fetch(`${this.documentServiceUrl}/Tags`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  }

  // ==================== Auth ====================

  /**
   * Search GitHub users
   */
  async searchGitHubUsers(token: string, query: string): Promise<GitHubSearchResponse> {
    const response = await fetch(
      `${this.baseUrl}/user/github/search-users?q=${encodeURIComponent(query)}`,
      { headers: this.getAuthHeaders(token) }
    );

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get login URL for GitHub OAuth
   */
  getGitHubLoginUrl(originUri: string): string {
    return `${this.baseUrl}/user/login?origin_uri=${encodeURIComponent(originUri)}`;
  }

  // ==================== Publish ====================

  /**
   * Publish document to GitHub
   */
  async publish(token: string, document: any): Promise<{
    message: string;
    commitUrl: string;
    branchName: string;
    pullRequestUrl?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/publish`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ document: JSON.stringify(document) }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to publish');
    }

    return response.json();
  }

  /**
   * Sync user's fork with upstream
   */
  async syncFork(token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/sync-fork`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to sync fork');
    }

    return response.json();
  }

  // ==================== Helpers ====================

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Factory function to create API service instance
let apiServiceInstance: ApiService | null = null;

export function getApiService(baseUrl: string): ApiService {
  if (!apiServiceInstance || apiServiceInstance['baseUrl'] !== baseUrl) {
    apiServiceInstance = new ApiService(baseUrl);
  }
  return apiServiceInstance;
}

export default ApiService;
