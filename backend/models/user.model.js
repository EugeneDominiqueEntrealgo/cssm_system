const { db } = require('../config/db');

// Helper to format user ID as 6-digit format (U100000, U100001, etc.)
const formatUserId = (id) => {
  return `U${String(100000 + Number(id)).padStart(6, '0')}`;
};

// Helper to add formatted user_id to user objects
const withUserId = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, role: userWithoutPassword.role === 'user' ? 'client' : userWithoutPassword.role, user_id: formatUserId(user.id) };
};

// Helper to format user with password (for auth controller)
const withUserIdAndPassword = (user) => {
  if (!user) return null;
  return { ...user, role: user.role === 'user' ? 'client' : user.role, user_id: formatUserId(user.id) };
};

const UserModel = {
  async findByEmail(email) {
    const user = await db.users.findOne({ email });
    return withUserIdAndPassword(user);
  },

  async findByIdentifier(identifier) {
    // identifier may be an email or the formatted user_id (e.g. U100000)
    if (!identifier) return null;
    if (String(identifier).toUpperCase().startsWith('U')) {
      const users = await db.users.find({ user_id: identifier });
      return withUserIdAndPassword(users[0] || null);
    }
    const user = await db.users.findOne({ email: identifier });
    return withUserIdAndPassword(user);
  },

  async findByIdWithPassword(id) {
    const user = await db.users.findById(id);
    return withUserIdAndPassword(user);
  },

  async findById(id) {
    const user = await db.users.findById(id);
    return withUserId(user);
  },

  async create({ name, email, password, role = 'staff', status = 'pending', created_by, first_name, middle_name, last_name, birthdate, gender, address, contract_details, phone, must_change_password }) {
    const normalizedRole = role === 'user' ? 'client' : role;

    // Build insert record without user_id (some backends may not have column)
    const record = { name, email, password, role: normalizedRole, status };
    if (created_by !== undefined) record.created_by = created_by;
    if (first_name !== undefined) record.first_name = first_name;
    if (middle_name !== undefined) record.middle_name = middle_name;
    if (last_name !== undefined) record.last_name = last_name;
    if (birthdate !== undefined) record.birthdate = birthdate;
    if (gender !== undefined) record.gender = gender;
    if (address !== undefined) record.address = address;
    if (contract_details !== undefined) record.contract_details = contract_details;
    if (phone !== undefined) record.phone = phone;
    // Additive: forced first-login password change flag (safe)
    record.must_change_password = must_change_password === undefined ? false : Boolean(must_change_password);

    const user = await db.users.insert(record);
    return withUserId(user);
  },

  async getAll() {
    const users = await db.users.getAll();
    return users.map(withUserId);
  },

  async getByRole(role) {
    if (role === 'client') {
      const [clients, legacyUsers] = await Promise.all([
        db.users.find({ role: 'client' }),
        db.users.find({ role: 'user' })
      ]);
      return [...clients, ...legacyUsers].map(withUserId);
    }

    const users = await db.users.find({ role });
    return users.map(withUserId);
  },

  async getPendingStaff() {
    const users = await db.users.find({ role: 'staff', status: 'pending' });
    return users.map(withUserId);
  },

  async getPendingClients() {
    const clients = await db.users.find({ role: 'client', status: 'pending' });
    const legacyClients = await db.users.find({ role: 'user', status: 'pending' });
    return [...clients, ...legacyClients].map(withUserId);
  },

  async getByCreatedBy(createdBy) {
    // Since created_by column may not exist in the database,
    // return all users so staff can see account statuses
    const users = await db.users.getAll();
    return users.map(withUserId);
  },

  async updateStatus(id, status) {
    return await db.users.update(id, { status });
  },

  async updatePassword(id, hashedPassword, mustChangePassword = null) {
    const updates = { password: hashedPassword };
    // Additive: optionally set/clear the forced-change flag
    if (mustChangePassword !== null) updates.must_change_password = Boolean(mustChangePassword);
    return await db.users.update(id, updates);
  },

  async update(id, { name, email, role, status, first_name, middle_name, last_name, birthdate, gender, address, contract_details, phone }) {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (first_name !== undefined) updates.first_name = first_name;
    if (middle_name !== undefined) updates.middle_name = middle_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (birthdate !== undefined) updates.birthdate = birthdate;
    if (gender !== undefined) updates.gender = gender;
    if (address !== undefined) updates.address = address;
    if (contract_details !== undefined) updates.contract_details = contract_details;
    if (phone !== undefined) updates.phone = phone;
    return await db.users.update(id, updates);
  },

  async delete(id) {
    return await db.users.delete(id);
  },

  async getCount() {
    return await db.users.count();
  }
};

module.exports = UserModel;
