/* Central TeamPass API compatibility layer.
 * Update this file when TeamPass changes routes, methods, payload fields or response wrappers.
 */
const TP_API = Object.freeze({
  schemaVersion: 2,
  supportedTeamPass: '3.2.x',
  basePath: '/api/index.php/',
  endpoints: Object.freeze({
    authorize: 'authorize',
    authorizeToken: 'authorizeToken',
    itemFindByUrl: 'item/findByUrl',
    itemGet: 'item/get',
    itemsInFolders: 'item/inFolders',
    itemCreate: 'item/create',
    itemUpdate: 'item/update',
    writableFolders: 'folder/writableFolders',
    listFolders: 'folder/listFolders',
    folderCreate: 'folder/create'
  }),
  methods: Object.freeze({
    authorize:'POST',authorizeToken:'POST',itemFindByUrl:'GET',itemGet:'GET',itemsInFolders:'GET',itemCreate:'POST',itemUpdate:'PUT',writableFolders:'GET',listFolders:'GET',folderCreate:'POST'
  }),
  capabilities:Object.freeze({
    authentication:['authorize','authorizeToken'],urlSearch:['itemFindByUrl'],itemRead:['itemGet','itemsInFolders'],itemWrite:['itemCreate','itemUpdate'],folderRead:['writableFolders','listFolders'],folderWrite:['folderCreate']
  }),
  requiredResponseFields:Object.freeze({authorize:['token'],authorizeToken:['token'],itemFindByUrl:[],itemGet:[],itemsInFolders:[],writableFolders:[],listFolders:[]}),
  route(name, params = {}) {
    const endpoint = this.endpoints[name];
    if (!endpoint) throw new Error(`Unknown TeamPass API endpoint: ${name}`);
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    }
    return endpoint + (query.size ? `?${query.toString()}` : '');
  },
  url(serverUrl, route) {
    return `${String(serverUrl).replace(/\/$/, '')}${this.basePath}${route}`;
  },
  unwrapList(data) {
    if (Array.isArray(data)) return data;
    for (const key of ['items', 'folders', 'data', 'results', 'result']) {
      if (Array.isArray(data?.[key])) return data[key];
    }
    return [];
  },
  unwrapObject(data) {
    if (Array.isArray(data)) data = data[0] || {};
    for (const key of ['item', 'folder', 'data', 'result']) {
      if (data?.[key] && !Array.isArray(data[key]) && typeof data[key] === 'object') return data[key];
    }
    return data && typeof data === 'object' ? data : {};
  },
  authorizeBody(cfg) {
    return cfg.authMode === 'token'
      ? { login: cfg.login, token: cfg.pat }
      : { apikey: cfg.apiKey, login: cfg.login, password: cfg.password };
  },
  itemCreateBody(draft) {
    return {
      label: String(draft.label || '').trim(), folder_id: Number(draft.folder_id),
      password: String(draft.password || ''), description: String(draft.description || ''),
      login: String(draft.login || ''), email: String(draft.email || ''),
      url: String(draft.url || ''), tags: '', anyone_can_modify: 0,
      renewal_period: 0, icon: 'fa-solid fa-key', totp: '',
      totp_algorithm: 'sha1', totp_digits: 6, totp_period: 30, fields: []
    };
  },
  itemUpdateBody(draft) {
    const body = {
      id: Number(draft.id), label: String(draft.label || ''), password: String(draft.password || ''),
      description: String(draft.description || ''), login: String(draft.login || ''),
      email: String(draft.email || ''), url: String(draft.url || ''), tags: String(draft.tags || ''),
      anyone_can_modify: Number(draft.anyone_can_modify || 0), renewal_period: Number(draft.renewal_period || 0),
      icon: String(draft.icon || 'fa-solid fa-key'), totp: String(draft.totp || ''),
      totp_algorithm: String(draft.totp_algorithm || 'sha1'), totp_digits: Number(draft.totp_digits || 6),
      totp_period: Number(draft.totp_period || 30), fields: Array.isArray(draft.fields) ? draft.fields : []
    };
    if (draft.folder_id) body.folder_id = Number(draft.folder_id);
    if (draft.revision != null) body.revision = Number(draft.revision);
    return body;
  },
  folderCreateBody(draft) {
    return {
      title: String(draft.title || '').trim(), parent_id: Number(draft.parent_id),
      complexity: Number(draft.complexity || 0), duration: 0, create_auth_without: 0,
      edit_auth_without: 0, icon: 'fa-solid fa-folder', icon_selected: 'fa-solid fa-folder-open',
      access_rights: 'W'
    };
  }
});
globalThis.TP_API = TP_API;
