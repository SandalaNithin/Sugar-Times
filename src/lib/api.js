import axiosInstance from "./axiosInstance";

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => axiosInstance.post("/auth/login", data),
  register: (data) => axiosInstance.post("/auth/register", data),
  guestRegister: (data) => axiosInstance.post("/auth/guest-register", data),
};

// ─── Articles ────────────────────────────────────────────────────────────────
export const articlesAPI = {
  getAll: (params) => axiosInstance.get("/articles", { params }),
  getById: (id) => axiosInstance.get(`/articles/${id}`),
  create: (data) => axiosInstance.post("/articles", data),
  update: (id, data) => axiosInstance.put(`/articles/${id}`, data),
  delete: (id) => axiosInstance.delete(`/articles/${id}`),
};

// ─── Markets ─────────────────────────────────────────────────────────────────
export const marketsAPI = {
  getAll: (params) => axiosInstance.get("/markets", { params }),
  create: (data) => axiosInstance.post("/markets", data),
  update: (id, data) => axiosInstance.put(`/markets/${id}`, data),
  delete: (id) => axiosInstance.delete(`/markets/${id}`),
};

// ─── Videos ──────────────────────────────────────────────────────────────────
export const videosAPI = {
  getAll: () => axiosInstance.get("/videos"),
  create: (data) => axiosInstance.post("/videos", data),
  delete: (id) => axiosInstance.delete(`/videos/${id}`),
};

// ─── Magazines ───────────────────────────────────────────────────────────────
export const magazinesAPI = {
  getAll: () => axiosInstance.get("/magazines"),
  create: (data) => axiosInstance.post("/magazines", data, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  delete: (id) => axiosInstance.delete(`/magazines/${id}`),
};

// ─── Subscriptions ───────────────────────────────────────────────────────────
export const subscriptionsAPI = {
  create: (data) => axiosInstance.post("/subscriptions/create", data),
  getByUser: (userId) => axiosInstance.get(`/subscriptions/user/${userId}`),
  search: (data) => axiosInstance.post("/subscriptions/search", data),
  renew: (data) => axiosInstance.post("/subscriptions/renew", data),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createOrder: (data) => axiosInstance.post("/payments/create-order", data),
  verify: (data) => axiosInstance.post("/payments/verify", data),
  handleFailure: (data) => axiosInstance.post("/payments/handle-failure", data),
};


// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => axiosInstance.get("/admin/stats"),
  getMonthlyRevenue: () => axiosInstance.get("/admin/monthly-revenue"),
  getUsers: (params) => axiosInstance.get("/admin/users", { params }),
  createUser: (data) => axiosInstance.post("/admin/users", data),
  updateUser: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
  getUserSubscription: (userId) => axiosInstance.get(`/admin/users/${userId}/subscription`),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  getEnquiries: (params) => axiosInstance.get("/admin/enquiries", { params }),
  getSubscriptions: (params) => axiosInstance.get("/admin/subscriptions", { params }),
  getPayments: (params) => axiosInstance.get("/admin/payments", { params }),
  updateSubscription: (id, data) => axiosInstance.put(`/admin/subscriptions/${id}`, data),
  deleteSubscription: (id) => axiosInstance.delete(`/admin/subscriptions/${id}`),
  deleteEnquiry: (id) => axiosInstance.delete(`/admin/enquiries/${id}`),
  updateEnquiryStatus: (id, status) => axiosInstance.patch(`/admin/enquiries/${id}/status`, { status }),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactAPI = {
  send: (data) => axiosInstance.post("/contact/send", data),
};

// ─── Media ────────────────────────────────────────────────────────────────────
export const mediaAPI = {
  getAll: () => axiosInstance.get("/uploads-api"),
  upload: (formData) => axiosInstance.post("/uploads-api", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  delete: (filename) => axiosInstance.delete(`/uploads-api/${filename}`),
};

// ─── Advertisements ──────────────────────────────────────────────────────────
export const adsAPI = {
  getAll: (params) => axiosInstance.get("/advertisements", { params }),
  create: (data) => axiosInstance.post("/advertisements", data),
  update: (id, data) => axiosInstance.put(`/advertisements/${id}`, data),
  delete: (id) => axiosInstance.delete(`/advertisements/${id}`),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getTree: () => axiosInstance.get("/categories"),
  getAllFlat: () => axiosInstance.get("/categories/all"),
  create: (data) => axiosInstance.post("/categories", data),
  update: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/categories/${id}`),
};

