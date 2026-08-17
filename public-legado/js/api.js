/* ==========================================================================
   NexClaim Enterprise - API Client
   ========================================================================== */
import { store } from './store.js';
import { showToast } from './utils.js';

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-User-Role': store.state.currentUser ? store.state.currentUser.role : 'ADMINISTRADOR'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.error || `Erro HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 403) {
          showToast(errorMsg, 'warning', 'Permissão Negada');
        } else {
          showToast(errorMsg, 'danger', 'Erro na Operação');
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth
  login(email) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Claims (Sinistros)
  getClaims() {
    return this.request('/claims');
  }

  getClaim(id) {
    return this.request(`/claims/${id}`);
  }

  createClaim(claimData) {
    return this.request('/claims', { method: 'POST', body: JSON.stringify(claimData) });
  }

  updateClaim(id, claimData) {
    return this.request(`/claims/${id}`, { method: 'PUT', body: JSON.stringify(claimData) });
  }

  updateClaimStatus(id, status) {
    return this.request(`/claims/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  getClaimDossier(id) {
    return this.request(`/claims/${id}/dossier`);
  }

  // Fines (Multas)
  getFines() {
    return this.request('/fines');
  }

  createFine(fineData) {
    return this.request('/fines', { method: 'POST', body: JSON.stringify(fineData) });
  }

  // Documents
  getDocuments() {
    return this.request('/documents');
  }

  createDocument(docData) {
    return this.request('/documents', { method: 'POST', body: JSON.stringify(docData) });
  }

  // Media
  getMedia() {
    return this.request('/media');
  }

  createMedia(mediaData) {
    return this.request('/media', { method: 'POST', body: JSON.stringify(mediaData) });
  }

  // Terms & Auto-Generator
  getTerms() {
    return this.request('/terms');
  }

  generateTerm(termData) {
    return this.request('/terms/generate', { method: 'POST', body: JSON.stringify(termData) });
  }

  // Registries
  getPeople() {
    return this.request('/people');
  }

  getVehicles() {
    return this.request('/vehicles');
  }

  getTimeline() {
    return this.request('/timeline');
  }

  getNotifications() {
    return this.request('/notifications');
  }

  getUsers() {
    return this.request('/users');
  }

  getAuditLog() {
    return this.request('/audit-log');
  }

  search(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiClient();
