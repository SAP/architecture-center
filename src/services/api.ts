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

  private get jsonHeaders(): HeadersInit {
    return { 'Content-Type': 'application/json' };
  }

  // Document Service (OData)
  private get documentServiceUrl(): string {
    return `${this.baseUrl}/quickstart/document-service`;
  }

  // ==================== Documents ====================

  async getDocuments(): Promise<Document[]> {
    const response = await fetch(
      `${this.documentServiceUrl}/Documents?$expand=author,contributors($expand=user),tags($expand=tag)`,
      { credentials: 'include', headers: this.jsonHeaders }
    );
    if (!response.ok) throw new Error(`Failed to fetch documents: ${response.statusText}`);
    const data = await response.json();
    return data.value;
  }

  async getDocument(documentId: string): Promise<Document> {
    const response = await fetch(
      `${this.documentServiceUrl}/Documents(${documentId})?$expand=author,contributors($expand=user),tags($expand=tag),assets`,
      { credentials: 'include', headers: this.jsonHeaders }
    );
    if (!response.ok) throw new Error(`Failed to fetch document: ${response.statusText}`);
    return response.json();
  }

  async createDocument(payload: CreateDocumentPayload): Promise<Document> {
    const response = await fetch(`${this.documentServiceUrl}/createNewDocument`, {
      method: 'POST',
      credentials: 'include',
      headers: this.jsonHeaders,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to create document');
    }
    return response.json();
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<void> {
    const response = await fetch(`${this.documentServiceUrl}/Documents(${documentId})`, {
      method: 'PATCH',
      credentials: 'include',
      headers: this.jsonHeaders,
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`Failed to update document: ${response.statusText}`);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${this.documentServiceUrl}/Documents(${documentId})`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to delete document: ${response.statusText}`);
  }

  async setDocumentContributors(documentId: string, contributorsUsernames: string[]): Promise<Document> {
    const response = await fetch(`${this.documentServiceUrl}/setDocumentContributors`, {
      method: 'POST',
      credentials: 'include',
      headers: this.jsonHeaders,
      body: JSON.stringify({ documentId, contributorsUsernames }),
    });
    if (!response.ok) throw new Error(`Failed to set contributors: ${response.statusText}`);
    return response.json();
  }

  async setDocumentTags(documentId: string, tags: string[]): Promise<Document> {
    const response = await fetch(`${this.documentServiceUrl}/setDocumentTags`, {
      method: 'POST',
      credentials: 'include',
      headers: this.jsonHeaders,
      body: JSON.stringify({ documentId, tags }),
    });
    if (!response.ok) throw new Error(`Failed to set tags: ${response.statusText}`);
    return response.json();
  }

  // ==================== Assets ====================

  async uploadAsset(documentId: string, file: File): Promise<DocumentAsset> {
    const content = await this.fileToBase64(file);
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets`, {
      method: 'POST',
      credentials: 'include',
      headers: this.jsonHeaders,
      body: JSON.stringify({ document_ID: documentId, mediaType: file.type, filename: file.name, content }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Failed to upload asset');
    }
    return response.json();
  }

  async getAssetWithContent(assetId: string): Promise<DocumentAsset & { content: string }> {
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})`, {
      credentials: 'include',
      headers: this.jsonHeaders,
    });
    if (!response.ok) throw new Error(`Failed to fetch asset: ${response.statusText}`);

    const asset = await response.json();
    console.log('[API] getAssetWithContent response:', {
      id: asset.ID,
      mediaType: asset.mediaType,
      hasContent: !!asset.content,
      contentType: typeof asset.content,
      contentLength: asset.content?.length,
    });

    if (asset.content) return asset;

    const contentResponse = await fetch(
      `${this.documentServiceUrl}/DocumentAssets(${assetId})/content`,
      { credentials: 'include' }
    );
    if (contentResponse.ok) {
      const blob = await contentResponse.blob();
      const base64 = await this.blobToBase64(blob);
      return { ...asset, content: base64 };
    }

    throw new Error('Could not retrieve asset content');
  }

  async getAsset(assetId: string): Promise<DocumentAsset> {
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})`, {
      credentials: 'include',
      headers: this.jsonHeaders,
    });
    if (!response.ok) throw new Error(`Failed to fetch asset: ${response.statusText}`);
    return response.json();
  }

  async getAssetContent(assetId: string): Promise<{ content: string; mediaType: string }> {
    const metadata = await this.getAsset(assetId);
    const response = await fetch(
      `${this.documentServiceUrl}/DocumentAssets(${assetId})/content`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error(`Failed to fetch asset content: ${response.statusText}`);
    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);
    return { content: base64, mediaType: metadata.mediaType };
  }

  async getAssetContentAsText(assetId: string): Promise<string> {
    const response = await fetch(
      `${this.documentServiceUrl}/DocumentAssets(${assetId})/content`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error(`Failed to fetch asset content: ${response.statusText}`);
    return response.text();
  }

  async deleteAsset(assetId: string): Promise<void> {
    const response = await fetch(`${this.documentServiceUrl}/DocumentAssets(${assetId})`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Failed to delete asset: ${response.statusText}`);
  }

  // ==================== Tags ====================

  async getTags(): Promise<Tag[]> {
    const response = await fetch(`${this.documentServiceUrl}/Tags`, {
      credentials: 'include',
      headers: this.jsonHeaders,
    });
    if (!response.ok) throw new Error(`Failed to fetch tags: ${response.statusText}`);
    const data = await response.json();
    return data.value;
  }

  // ==================== Auth ====================

  async searchGitHubUsers(query: string): Promise<GitHubSearchResponse> {
    const response = await fetch(
      `${this.baseUrl}/user/github/search-users?q=${encodeURIComponent(query)}`,
      { credentials: 'include', headers: this.jsonHeaders }
    );
    if (!response.ok) throw new Error(`Failed to search users: ${response.statusText}`);
    return response.json();
  }

  getGitHubLoginUrl(originUri: string): string {
    return `${this.baseUrl}/user/login?origin_uri=${encodeURIComponent(originUri)}`;
  }

  // ==================== Publish ====================

  async publish(document: any): Promise<{
    message: string;
    commitUrl: string;
    branchName: string;
    pullRequestUrl?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/publish`, {
      method: 'POST',
      credentials: 'include',
      headers: this.jsonHeaders,
      body: JSON.stringify({ document: JSON.stringify(document) }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to publish');
    }
    return response.json();
  }

  async syncFork(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/sync-fork`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to sync fork');
    }
    return response.json();
  }

  // ==================== Helpers ====================

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
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
