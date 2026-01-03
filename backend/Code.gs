/**
 * BananasEdu Beta - Backend API
 * Google Apps Script untuk autentikasi (Login & Register)
 * 
 * SETUP:
 * 1. Buat Google Spreadsheet baru
 * 2. Copy Spreadsheet ID dari URL
 * 3. Ganti SPREADSHEET_ID di bawah
 * 4. Deploy sebagai Web App (Execute as: Me, Access: Anyone)
 */

// ================== CONFIGURATION ==================
const SPREADSHEET_ID = '1hpbtVZNMGdr3ddlLDpRhIHwWXKuFHli0tlfOqsQr6xc'; // UTAMA: Ganti ID ini jika membuat spreadsheet baru. Gunakan setupNewSpreadsheet() untuk inisialisasi.
const SHEET_NAME = 'Users';

/**
 * UTILITY: Setup semua sheet otomatis
 * Panggil fungsi ini sekali setelah mengganti SPREADSHEET_ID
 */
function setupNewSpreadsheet() {
  try {
    getOrCreateSheet(); // Users
    getOrCreateActivityLogSheet(); // ActivityLogs
    getOrCreateFeedbackSheet(); // Feedback
    getOrCreateStudentGradesSheet(); // StudentGrades
    getOrCreateGradesSheet(); // Grades (Legacy/Admin)
    return "✅ Semua sheet berhasil dibuat/diinisialisasi!";
  } catch (e) {
    return "❌ Eror setup: " + e.message;
  }
}

// ================== HELPERS ==================

/**
 * Generate 10-digit unique ID untuk user ID
 */
function generateUUID() {
  // Generate random 10-digit number (1000000000 - 9999999999)
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Hash password DISABLED - Using Plain Text as requested
 */
function hashPassword(password) {
  // Return plain password directly
  return password;
}

/**
 * Get or create Users sheet
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create new sheet if it doesn't exist
    sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastColumn() === 0) {
      const headers = ['id', 'username', 'fullName', 'password', 'schoolLevel', 'schoolStatus', 'schoolName', 'classLevel', 'major', 'className', 'createdAt', 'lastLogin', 'role'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  } else {
    // Optimization: Check for missing columns (schoolStatus, username)
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // 1. Check for 'username' (should be after 'id')
    if (!headers.includes('username')) {
      const idIndex = headers.indexOf('id');
      if (idIndex !== -1) {
        const colToInsertAfter = idIndex + 1;
        sheet.insertColumnAfter(colToInsertAfter);
        sheet.getRange(1, colToInsertAfter + 1).setValue('username').setFontWeight('bold');
        
        // Populate existing rows with a placeholder username if needed (optional)
        // For now, just adding the empty column is safe
      }
    }

    // Refresh headers after potential 'username' insertion
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 2. Check for 'schoolStatus' (should be after 'schoolLevel')
    if (!updatedHeaders.includes('schoolStatus')) {
      const levelIndex = updatedHeaders.indexOf('schoolLevel');
      if (levelIndex !== -1) {
        const colToInsertAfter = levelIndex + 1;
        sheet.insertColumnAfter(colToInsertAfter);
        sheet.getRange(1, colToInsertAfter + 1).setValue('schoolStatus').setFontWeight('bold');
      }
    }
  }
  
  return sheet;
}

/**
 * EMERGENCY: Reset admin password
 * Run this function manually from Apps Script Editor if you can't login
 * 
 * Usage:
 * 1. Open Apps Script Editor
 * 2. Select 'resetAdminPassword' from function dropdown
 * 3. Click Run
 * 4. Login with username: admin, password: admin123
 */
function resetAdminPassword() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const usernameCol = headers.indexOf('username') + 1;
  const passwordCol = headers.indexOf('password') + 1;
  const roleCol = headers.indexOf('role') + 1;
  
  // Find admin row or first row with role='admin'
  let adminRow = -1;
  for (let i = 1; i < data.length; i++) {
    const username = data[i][usernameCol - 1];
    const role = data[i][roleCol - 1];
    
    if (username === 'admin' || role === 'admin') {
      adminRow = i + 1;
      break;
    }
  }
  
  if (adminRow === -1) {
    // No admin found - create one
    const newAdminRow = [
      Utilities.getUuid(),
      'admin',
      'Administrator',
      hashPassword('admin123'),
      'SMA',
      'Negeri',
      'SYSTEM',
      '12',
      'IPA',
      'System',
      new Date(),
      '',
      'admin'
    ];
    sheet.appendRow(newAdminRow);
    Logger.log('Created new admin account: admin / admin123');
    return 'Created new admin: admin / admin123';
  } else {
    // Reset existing admin
    sheet.getRange(adminRow, usernameCol).setValue('admin');
    sheet.getRange(adminRow, passwordCol).setValue(hashPassword('admin123'));
    sheet.getRange(adminRow, roleCol).setValue('admin');
    Logger.log('Reset admin password at row ' + adminRow + ': admin / admin123');
    return 'Reset admin at row ' + adminRow + ': admin / admin123';
  }
}

/**
 * MANUAL: Reset any user's password
 * Run this function from Apps Script Editor to reset a specific user's password
 * 
 * Usage:
 * 1. Change the TARGET_USERNAME and NEW_PASSWORD below
 * 2. Select 'resetUserPassword' from function dropdown
 * 3. Click Run
 * 4. Check Logs (Ctrl+Enter) to see the result
 */
function resetUserPassword() {
  // ===== CHANGE THESE VALUES =====
  const TARGET_USERNAME = 'student1';  // Username to reset
  const NEW_PASSWORD = 'Student123';   // New password (min 8 chars, A-Z, a-z, 0-9)
  // ================================
  
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const usernameCol = headers.indexOf('username');
  const passwordCol = headers.indexOf('password');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][usernameCol] === TARGET_USERNAME) {
      const hashedPassword = hashPassword(NEW_PASSWORD);
      sheet.getRange(i + 1, passwordCol + 1).setValue(hashedPassword);
      Logger.log('✅ Password reset for: ' + TARGET_USERNAME);
      Logger.log('New password: ' + NEW_PASSWORD);
      return 'Password reset successful for ' + TARGET_USERNAME;
    }
  }
  
  Logger.log('❌ User not found: ' + TARGET_USERNAME);
  return 'User not found: ' + TARGET_USERNAME;
}

/**
 * MANUAL: Hash a plain text password
 * Useful if you want to manually set a password in the spreadsheet
 * 
 * Usage:
 * 1. Change PASSWORD_TO_HASH below
 * 2. Run this function
 * 3. Copy the hash from Logs and paste into spreadsheet
 */
function getPasswordHash() {
  const PASSWORD_TO_HASH = 'YourPassword123'; // Change this
  
  const hash = hashPassword(PASSWORD_TO_HASH);
  Logger.log('Password: ' + PASSWORD_TO_HASH);
  Logger.log('Hash: ' + hash);
  return hash;
}

// ================== ACTIVITY LOGS ==================

const ACTIVITY_LOG_SHEET = 'ActivityLogs';

function getOrCreateActivityLogSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(ACTIVITY_LOG_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(ACTIVITY_LOG_SHEET);
    const headers = ['id', 'timestamp', 'action', 'userId', 'username', 'details', 'userAgent'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  } else {
     // Ensure userAgent column exists
     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
     if (!headers.includes('userAgent')) {
       sheet.getRange(1, headers.length + 1).setValue('userAgent').setFontWeight('bold');
     }
  }
  
  return sheet;
}

function logActivity(action, userId, username, details, userAgent) {
  try {
    const sheet = getOrCreateActivityLogSheet();
    const now = new Date().toISOString();
    const logId = Utilities.getUuid();
    
    // Check if userAgent column exists and where
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const uaIndex = headers.indexOf('userAgent');
    
    const row = [logId, now, action, userId || '', username || '', details || ''];
    
    if (uaIndex !== -1) {
       // Pad row if needed to reach uaIndex
       while (row.length < uaIndex) row.push('');
       row[uaIndex] = userAgent || '';
    } else {
       // Just append if not found (fallback)
       row.push(userAgent || '');
    }
    
    sheet.appendRow(row);
  } catch (e) {
    // Silent fail - don't break main operation
    Logger.log('Log error: ' + e.message);
  }
}

// ================== FEEDBACK SHEET ==================

const FEEDBACK_SHEET = 'Feedback';

function getOrCreateFeedbackSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(FEEDBACK_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(FEEDBACK_SHEET);
    const headers = ['id', 'userId', 'username', 'type', 'message', 'rating', 'createdAt', 'deviceInfo'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  return sheet;
}

function handleSaveFeedback(data) {
  if (!data.userId || !data.message) {
    return { success: false, error: 'User ID and message required' };
  }
  
  const sheet = getOrCreateFeedbackSheet();
  const now = new Date();
  
  sheet.appendRow([
    Utilities.getUuid(),
    data.userId,
    data.username || '',
    data.type || 'general',
    data.message,
    data.rating || '',
    now,
    data.deviceInfo || ''
  ]);
  
  logActivity('FEEDBACK', data.userId, data.username, `Feedback received: ${data.type}`, data.deviceInfo);
  
  return { success: true, message: 'Feedback terkirim!' };
}

function handleGetAllLogs(data) {
  const sheet = getOrCreateActivityLogSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const logs = [];
  for (let i = 1; i < allData.length; i++) {
    logs.push({
      id: allData[i][headers.indexOf('id')],
      timestamp: allData[i][headers.indexOf('timestamp')],
      action: allData[i][headers.indexOf('action')],
      userId: allData[i][headers.indexOf('userId')],
      username: allData[i][headers.indexOf('username')],
      details: allData[i][headers.indexOf('details')]
    });
  }
  
  // Sort by timestamp descending (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return { success: true, logs: logs };
}

/**
 * Find user by username
 */
function findUserByUsername(username) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  for (let i = 1; i < data.length; i++) {
    if (data[i][headerMap['username']] && data[i][headerMap['username']].toString().toLowerCase() === username.toLowerCase()) {
      return {
        row: i + 1,
        id: data[i][headerMap['id']],
        username: data[i][headerMap['username']],
        fullName: data[i][headerMap['fullName']],
        password: data[i][headerMap['password']],
        schoolLevel: data[i][headerMap['schoolLevel']],
        schoolName: data[i][headerMap['schoolName']],
        classLevel: data[i][headerMap['classLevel']],
        major: data[i][headerMap['major']],
        className: data[i][headerMap['className']],
        role: data[i][headerMap['role']] || 'student'
      };
    }
  }
  return null;
}

/**
 * Check if username is available
 */
function handleCheckUsername(data) {
  if (!data.username || data.username.trim() === '') {
    return { success: false, error: 'Username tidak boleh kosong' };
  }
  
  const username = data.username.trim().toLowerCase();
  
  // Validate username format (alphanumeric and underscore only)
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { success: false, available: false, error: 'Username hanya boleh huruf, angka, dan underscore' };
  }
  
  if (username.length < 4) {
    return { success: false, available: false, error: 'Username minimal 4 karakter' };
  }
  
  const existingUser = findUserByUsername(username);
  if (existingUser) {
    return { success: true, available: false };
  }
  
  return { success: true, available: true };
}

/**
 * Find user by full name (legacy - keeping for backup)
function findUserByName(fullName) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  for (let i = 1; i < data.length; i++) {
    if (data[i][headerMap['fullName']] && data[i][headerMap['fullName']].toString().toUpperCase() === fullName.toUpperCase()) {
      return {
        row: i + 1,
        id: data[i][headerMap['id']],
        fullName: data[i][headerMap['fullName']],
        password: data[i][headerMap['password']],
        schoolLevel: data[i][headerMap['schoolLevel']],
        schoolName: data[i][headerMap['schoolName']],
        classLevel: data[i][headerMap['classLevel']],
        major: data[i][headerMap['major']],
        className: data[i][headerMap['className']],
        createdAt: data[i][headerMap['createdAt']],
        lastLogin: data[i][headerMap['lastLogin']],
        role: data[i][headerMap['role']] || 'student' // Default to student if not set
      };
    }
  }
  
  return null;
}

/**
 * Generate simple session token
 */
function generateSessionToken(userId) {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2);
  return `${userId}_${timestamp}_${random}`;
}

// ================== API HANDLERS ==================

/**
 * Handle CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Main POST handler
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Capture pseudo-device info if sent in data (optional)
    const userAgent = data.deviceInfo || ''; // Frontend should send this
    
    let result;
    
    switch (action) {
      case 'register':
        result = handleRegister(data, userAgent);
        break;
      case 'login':
        result = handleLogin(data, userAgent);
        break;
      case 'checkUsername':
        result = handleCheckUsername(data);
        break;
      case 'saveFeedback':
        result = handleSaveFeedback(data);
        break;
      case 'changePassword':
        result = handleChangePassword(data, userAgent);
        break;
        break;
      case 'getAllUsers':
        result = handleGetAllUsers(data);
        break;
      case 'updateUser':
        result = handleUpdateUser(data);
        break;
      case 'deleteUser':
        result = handleDeleteUser(data);
        break;
      case 'getGrades':
        result = handleGetGrades(data);
        break;
      case 'saveGrades':
        result = handleSaveGrades(data);
        break;
      case 'getAllGrades':
        result = handleGetAllGrades(data);
        break;
      case 'updateGrade':
        result = handleUpdateGrade(data);
        break;
      case 'deleteGrade':
        result = handleDeleteGrade(data);
        break;
      case 'getAllLogs':
        result = handleGetAllLogs(data);
        break;
      case 'changePassword':
        result = handleChangePassword(data);
        break;
      case 'updateProfile':
        result = handleUpdateProfile(data);
        break;
      case 'saveStudentGrades':
        result = handleSaveStudentGrades(data);
        break;
      case 'getStudentGrades':
        result = handleGetStudentGrades(data);
        break;
      case 'getDashboardStats':
        result = handleGetDashboardStats(data);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
    
    return createJsonResponse(result);
    
  } catch (error) {
    return createJsonResponse({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
}

/**
 * Handle GET request (for testing)
 */
function doGet(e) {
  return createJsonResponse({
    success: true,
    message: 'BananasEdu Beta API is running',
    version: '1.0.0',
    endpoints: ['register', 'login']
  });
}

/**
 * Create JSON response with CORS headers
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ================== SECURITY HELPERS ==================

/**
 * Validate input to prevent Formula Injection and basic XSS
 * Returns { start: boolean, error: string | null }
 */
function validateInput(text, fieldName) {
  if (!text) return { valid: true }; // Allow empty if handled elsewhere
  const str = String(text);
  
  // 1. Prevent Formula Injection (Starting with =)
  if (str.startsWith('=')) {
    return { valid: false, error: `${fieldName} tidak boleh diawali tanda =` };
  }
  
  // 2. Prevent Common HTML/Script Tags (Basic XSS)
  if (/<script\b[^>]*>([\s\S]*?)<\/script>/gm.test(str)) {
    return { valid: false, error: `${fieldName} mengandung karakter tidak aman` };
  }
  
  return { valid: true };
}

// ================== REGISTER (Updated for Plain Text) ==================

function handleRegister(data, userAgent) {
  // ... validation ...
  const requiredFields = ['username', 'fullName', 'password', 'schoolLevel', 'schoolName', 'classLevel', 'className'];
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      return { success: false, error: `Field ${field} is required` };
    }
    // SECURITY EXTENSION: VALIDATE ALL INPUTS
    const securityCheck = validateInput(data[field], field);
    if (!securityCheck.valid) {
      return { success: false, error: securityCheck.error };
    }
  }

  const username = data.username.trim().toLowerCase();
  
  // Strict Username Validation
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username hanya boleh huruf kecil, angka, dan underscore' };
  }

  if (findUserByUsername(username)) {
    return { success: false, error: 'Username sudah digunakan' };
  }
  
  // Validation password structure
  if (data.password.length < 8) return { success: false, error: 'Password minimal 8 karakter' };
  // ... can keep other checks ...

  // Password hashing removed - use plain text
  const passwordToStore = data.password; // NO HASHING
  
  const sheet = getOrCreateSheet();
  const userId = generateUUID();
  const now = new Date();
  
  const newRow = [
    userId,
    username,
    data.fullName.toUpperCase().replace(/^=/, "'="), // Extra safety: Escape leading = if it somehow bypasses
    passwordToStore, // PLAIN TEXT
    data.schoolLevel,
    data.schoolStatus || '',
    data.schoolName.toUpperCase().replace(/^=/, "'="),
    data.classLevel,
    data.major ? data.major.toUpperCase() : '',
    data.className.toUpperCase(),
    now,
    '', 
    'student'
  ];
  
  sheet.appendRow(newRow);
  
  logActivity('REGISTER', userId, username, 'User registered: ' + data.fullName, userAgent);
  
  return { 
    success: true, 
    message: 'Registrasi berhasil! Silakan login dengan username.' 
  };
}

// ================== LOGIN (Updated for Plain Text & Logs) ==================

function handleLogin(data, userAgent) {
  if (!data.username || !data.password) {
    return { success: false, error: 'Username dan password harus diisi' };
  }
  
  const user = findUserByUsername(data.username);
  if (!user) {
    return { success: false, error: 'Username atau password salah' };
  }
  
  // Checks are now plain text only, but we already updated hashPassword helper to return plain text
  // so existing code calls hashPassword(data.password) which now returns data.password
  // and compares with user.password.
  // If user.password is HASHED (legacy), it won't match. 
  
  // To handle plain text transition:
  const isValidPassword = (user.password === data.password);
  
  if (!isValidPassword) {
     return { success: false, error: 'Username atau password salah' };
  }
  
  const sheet = getOrCreateSheet();
  sheet.getRange(user.row, 11).setValue(new Date()); 
  
  const token = generateSessionToken(user.id);
  
  // LOG DEVICE INFO
  logActivity('LOGIN', user.id, user.username, 'Login successful', userAgent);
  
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      schoolLevel: user.schoolLevel,
      schoolName: user.schoolName,
      classLevel: user.classLevel,
      major: user.major,
      className: user.className,
      role: user.role || 'student'
    },
    token: token
  };
}
  


// ================== GRADES SHEET HELPER ==================

const GRADES_SHEET_NAME = 'Grades';

function getOrCreateGradesSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(GRADES_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(GRADES_SHEET_NAME);
    const headers = ['id', 'userId', 'semester', 'subject', 'grade', 'createdAt', 'updatedAt'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  return sheet;
}

// ================== ADMIN: GET ALL USERS ==================

function handleGetAllUsers(data) {
  const sheet = getOrCreateSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const users = [];
  for (let i = 1; i < allData.length; i++) {
    users.push({
      id: allData[i][headers.indexOf('id')],
      username: allData[i][headers.indexOf('username')],
      fullName: allData[i][headers.indexOf('fullName')],
      password: '••••••••', // Masked password - not actual hash
      schoolLevel: allData[i][headers.indexOf('schoolLevel')],
      schoolStatus: allData[i][headers.indexOf('schoolStatus')] || '',
      schoolName: allData[i][headers.indexOf('schoolName')],
      classLevel: allData[i][headers.indexOf('classLevel')],
      major: allData[i][headers.indexOf('major')],
      className: allData[i][headers.indexOf('className')],
      createdAt: allData[i][headers.indexOf('createdAt')],
      role: allData[i][headers.indexOf('role')] || 'student'
    });
  }
  
  return { success: true, users: users };
}

// ================== ADMIN: UPDATE USER ==================

function handleUpdateUser(data) {
  if (!data.userId) {
    return { success: false, error: 'User ID required' };
  }
  
  const sheet = getOrCreateSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][headers.indexOf('id')] === data.userId) {
      // Update fields if provided
      if (data.username) {
         const newUsername = data.username.toLowerCase().trim();
         const currentUsername = allData[i][headers.indexOf('username')];
         if (newUsername !== currentUsername) {
             if (findUserByUsername(newUsername)) return { success: false, error: 'Username sudah digunakan' };
             sheet.getRange(i + 1, headers.indexOf('username') + 1).setValue(newUsername);
         }
      }
      if (data.fullName) sheet.getRange(i + 1, headers.indexOf('fullName') + 1).setValue(data.fullName);
      if (data.schoolLevel) sheet.getRange(i + 1, headers.indexOf('schoolLevel') + 1).setValue(data.schoolLevel);
      if (data.schoolName) sheet.getRange(i + 1, headers.indexOf('schoolName') + 1).setValue(data.schoolName);
      if (data.classLevel) sheet.getRange(i + 1, headers.indexOf('classLevel') + 1).setValue(data.classLevel);
      if (data.major) sheet.getRange(i + 1, headers.indexOf('major') + 1).setValue(data.major);
      if (data.className) sheet.getRange(i + 1, headers.indexOf('className') + 1).setValue(data.className);
      if (data.role) sheet.getRange(i + 1, headers.indexOf('role') + 1).setValue(data.role);
      
      // Log activity
      logActivity('UPDATE_USER', data.userId, allData[i][headers.indexOf('username')], 'User updated by admin');
      
      return { success: true, message: 'User updated' };
    }
  }
  
  return { success: false, error: 'User not found' };
}

// ================== ADMIN: DELETE USER ==================

function handleDeleteUser(data) {
  if (!data.userId) {
    return { success: false, error: 'User ID required' };
  }
  
  const sheet = getOrCreateSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][headers.indexOf('id')] === data.userId) {
      const deletedUsername = allData[i][headers.indexOf('username')];
      const deletedName = allData[i][headers.indexOf('fullName')];
      sheet.deleteRow(i + 1);
      
      // Log activity
      logActivity('DELETE_USER', data.userId, deletedUsername, 'User deleted: ' + deletedName);
      
      return { success: true, message: 'User deleted' };
    }
  }
  
  return { success: false, error: 'User not found' };
}

// ================== GRADES: GET BY USER ==================

function handleGetGrades(data) {
  if (!data.userId) {
    return { success: false, error: 'User ID required' };
  }
  
  const sheet = getOrCreateGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const grades = [];
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][headers.indexOf('userId')] === data.userId) {
      grades.push({
        id: allData[i][headers.indexOf('id')],
        semester: allData[i][headers.indexOf('semester')],
        subject: allData[i][headers.indexOf('subject')],
        grade: allData[i][headers.indexOf('grade')],
        createdAt: allData[i][headers.indexOf('createdAt')]
      });
    }
  }
  
  return { success: true, grades: grades };
}

// ================== GRADES: SAVE ==================

function handleSaveGrades(data) {
  if (!data.userId || !data.grades || !Array.isArray(data.grades)) {
    return { success: false, error: 'userId and grades array required' };
  }
  
  const sheet = getOrCreateGradesSheet();
  const now = new Date().toISOString();
  
  for (const g of data.grades) {
    const newRow = [
      Utilities.getUuid(),
      data.userId,
      g.semester || '',
      g.subject || '',
      g.grade || 0,
      now,
      now
    ];
    sheet.appendRow(newRow);
  }
  
  return { success: true, message: 'Grades saved', count: data.grades.length };
}

// ================== ADMIN: GET ALL GRADES ==================

function handleGetAllGrades(data) {
  const sheet = getOrCreateGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const grades = [];
  for (let i = 1; i < allData.length; i++) {
    grades.push({
      id: allData[i][headers.indexOf('id')],
      userId: allData[i][headers.indexOf('userId')],
      semester: allData[i][headers.indexOf('semester')],
      subject: allData[i][headers.indexOf('subject')],
      grade: allData[i][headers.indexOf('grade')],
      createdAt: allData[i][headers.indexOf('createdAt')]
    });
  }
  
  return { success: true, grades: grades };
}

// ================== ADMIN: UPDATE GRADE ==================

function handleUpdateGrade(data) {
  if (!data.gradeId) {
    return { success: false, error: 'Grade ID required' };
  }
  
  const sheet = getOrCreateGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][headers.indexOf('id')] === data.gradeId) {
      // Update fields if provided
      if (data.semester !== undefined) sheet.getRange(i + 1, headers.indexOf('semester') + 1).setValue(data.semester);
      if (data.subject !== undefined) sheet.getRange(i + 1, headers.indexOf('subject') + 1).setValue(data.subject);
      if (data.grade !== undefined) sheet.getRange(i + 1, headers.indexOf('grade') + 1).setValue(data.grade);
      sheet.getRange(i + 1, headers.indexOf('updatedAt') + 1).setValue(new Date().toISOString());
      
      return { success: true, message: 'Grade updated' };
    }
  }
  
  return { success: false, error: 'Grade not found' };
}

// ================== ADMIN: DELETE GRADE ==================

function handleDeleteGrade(data) {
  if (!data.gradeId) {
    return { success: false, error: 'Grade ID required' };
  }
  
  const sheet = getOrCreateGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][headers.indexOf('id')] === data.gradeId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Grade deleted' };
    }
  }
  
  return { success: false, error: 'Grade not found' };
}

// ================== TEST FUNCTION ==================

/**
 * Test function - run this to verify setup
 */
function testSetup() {
  try {
    const sheet = getOrCreateSheet();
    Logger.log('✅ Sheet created/accessed successfully: ' + sheet.getName());
    Logger.log('✅ Setup complete! You can now deploy as Web App.');
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    Logger.log('Make sure SPREADSHEET_ID is correct.');
  }
}

// ================== ADMIN SETUP HELPER ==================
function createAdminAccount() {
  const sheet = getOrCreateSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // 1. Ensure 'role' column exists
  let roleIndex = headers.indexOf('role');
  if (roleIndex === -1) {
    sheet.getRange(1, headers.length + 1).setValue('role').setFontWeight('bold');
    roleIndex = headers.length; // New index
    Logger.log('Added "role" column.');
  }

  // 2. Check if admin exists
  const adminName = 'Ban4n43du4dmin';
  const data = sheet.getDataRange().getValues();
  let adminExists = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === adminName) {
      adminExists = true;
      // Force update role to admin just in case
      if (roleIndex < data[i].length) {
         sheet.getRange(i + 1, roleIndex + 1).setValue('admin');
      }
      Logger.log('Admin account already exists. Role updated to admin.');
      break;
    }
  }

  // 3. Create Admin if not exists
  if (!adminExists) {
    const newAdmin = [
      Utilities.getUuid(),      // id
      adminName,                // fullName
      hashPassword('08231Maliffa'), // password (HASHED)
      'Admin School',           // schoolLevel
      'SMAN Admin',             // schoolName
      '12',                     // classLevel
      'IPA',                    // major
      'Admin Class',            // className
      new Date().toISOString(), // createdAt
      new Date().toISOString(), // lastLogin
      'admin'                   // role
    ];
    sheet.appendRow(newAdmin);
    Logger.log('✅ Admin account created successfully!');
    Logger.log('Username: ' + adminName);
    Logger.log('Password: (Hidden)');
  }
}

// ================== CHANGE PASSWORD ==================

function handleChangePassword(data, userAgent) {
  if (!data.userId || !data.oldPassword || !data.newPassword) {
    return { success: false, error: 'Semua field harus diisi' };
  }
  
  // Password validation: min 8 chars
  if (data.newPassword.length < 8) {
    return { success: false, error: 'Password baru minimal 8 karakter' };
  }
  
  // Reuse existing validation checks or simplify as needed
  if (!/[a-z]/.test(data.newPassword)) return { success: false, error: 'Password harus mengandung huruf kecil' };
  if (!/[A-Z]/.test(data.newPassword)) return { success: false, error: 'Password harus mengandung huruf besar' };
  if (!/[0-9]/.test(data.newPassword)) return { success: false, error: 'Password harus mengandung angka' };

  if (data.newPassword === data.oldPassword) {
    return { success: false, error: 'Password baru tidak boleh sama dengan password lama' };
  }
  
  const sheet = getOrCreateSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const idCol = headers.indexOf('id');
  const passwordCol = headers.indexOf('password');
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(data.userId)) {
      const storedPassword = allData[i][passwordCol];
      
      // Check old password - Plain Text comparison primarily
      // hashPassword now returns plain text, so hashPassword(data.oldPassword) === data.oldPassword
      const isValidOld = (storedPassword === data.oldPassword);
      
      if (!isValidOld) {
         // Optional: Check if stored is legacy hash? Not doing here to force migration or reset
         return { success: false, error: 'Password lama salah' };
      }
      
      // Update to new PLAIN TEXT password
      sheet.getRange(i + 1, passwordCol + 1).setValue(data.newPassword);
      
      // Log with User Agent
      logActivity('CHANGE_PASSWORD', data.userId, allData[i][headers.indexOf('username')], 'Password changed', userAgent);
      
      return { success: true, message: 'Password berhasil diubah' };
    }
  }
  
  return { success: false, error: 'User tidak ditemukan' };
}

// ================== UPDATE PROFILE (STUDENT) ==================

function handleUpdateProfile(data) {
  if (!data.userId) {
    return { success: false, error: 'User ID required' };
  }
  
  const sheet = getOrCreateSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(data.userId)) {
      // Update fields if provided
      if (data.username) {
        const newUsername = data.username.toLowerCase().trim();
        const currentUsername = allData[i][headers.indexOf('username')];
        if (newUsername !== currentUsername) {
             const existing = findUserByUsername(newUsername);
             if (existing) return { success: false, error: 'Username sudah digunakan' };
             
             const col = headers.indexOf('username');
             if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(newUsername);
        }
      }

      if (data.fullName) {
        const col = headers.indexOf('fullName');
        if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(data.fullName);
      }
      if (data.schoolName) {
        const col = headers.indexOf('schoolName');
        if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(data.schoolName);
      }
      if (data.classLevel) {
        const col = headers.indexOf('classLevel');
        if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(data.classLevel);
      }
      if (data.major !== undefined) {
        const col = headers.indexOf('major');
        if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(data.major);
      }
      if (data.className) {
        const col = headers.indexOf('className');
        if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(data.className);
      }
      
      // Log activity
      logActivity('UPDATE_PROFILE', data.userId, allData[i][headers.indexOf('username')], 'Profile updated by user');
      
      // Return updated user data
      return { 
        success: true, 
        message: 'Profil berhasil diperbarui',
        user: {
          id: allData[i][idCol],
          username: allData[i][headers.indexOf('username')],
          fullName: data.fullName || allData[i][headers.indexOf('fullName')],
          schoolLevel: allData[i][headers.indexOf('schoolLevel')],
          schoolName: data.schoolName || allData[i][headers.indexOf('schoolName')],
          classLevel: data.classLevel || allData[i][headers.indexOf('classLevel')],
          major: data.major !== undefined ? data.major : allData[i][headers.indexOf('major')],
          className: data.className || allData[i][headers.indexOf('className')],
          role: allData[i][headers.indexOf('role')] || 'student'
        }
      };
    }
  }
  
  return { success: false, error: 'User tidak ditemukan' };
}

// ================== STUDENT GRADES (E-RAPOR SYNC) ==================

const STUDENT_GRADES_SHEET = 'StudentGrades';

/**
 * Get or create StudentGrades sheet for E-Rapor data
 */
function getOrCreateStudentGradesSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(STUDENT_GRADES_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(STUDENT_GRADES_SHEET);
    const headers = ['userId', 'subjectsJson', 'updatedAt'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * Save student grades (E-Rapor subjects array)
 * Receives: { userId, subjects: [{id, name, sem1, sem2, ...}] }
 */
function handleSaveStudentGrades(data) {
  if (!data.userId || !data.subjects) {
    return { success: false, error: 'userId dan subjects diperlukan' };
  }
  
  const sheet = getOrCreateStudentGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const userIdCol = headers.indexOf('userId');
  const subjectsCol = headers.indexOf('subjectsJson');
  const updatedCol = headers.indexOf('updatedAt');
  
  const subjectsJson = JSON.stringify(data.subjects);
  const now = new Date();
  
  // Find existing row for this user
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][userIdCol]) === String(data.userId)) {
      // Update existing row
      sheet.getRange(i + 1, subjectsCol + 1).setValue(subjectsJson);
      sheet.getRange(i + 1, updatedCol + 1).setValue(now);
      
      return { success: true, message: 'Nilai berhasil disimpan' };
    }
  }
  
  // No existing row, create new
  sheet.appendRow([data.userId, subjectsJson, now]);
  
  return { success: true, message: 'Nilai berhasil disimpan' };
}

/**
 * Get student grades (E-Rapor subjects array)
 * Receives: { userId }
 * Returns: { success, subjects: [...] }
 */
function handleGetStudentGrades(data) {
  if (!data.userId) {
    return { success: false, error: 'userId diperlukan' };
  }
  
  const sheet = getOrCreateStudentGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const userIdCol = headers.indexOf('userId');
  const subjectsCol = headers.indexOf('subjectsJson');
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][userIdCol]) === String(data.userId)) {
      try {
        const subjects = JSON.parse(allData[i][subjectsCol]);
        return { success: true, subjects: subjects };
      } catch (e) {
        return { success: false, error: 'Data nilai rusak' };
      }
    }
  }
  
  // No data found - return empty array (not an error)
  return { success: true, subjects: [] };
}

// ================== DASHBOARD STATISTICS ==================

/**
 * Get dashboard statistics for a student
 * Receives: { userId }
 * Returns: { success, stats: { averageScore, subjectCount, filledSemesters, gradeDistribution, semesterAverages } }
 */
function handleGetDashboardStats(data) {
  if (!data.userId) {
    return { success: false, error: 'userId diperlukan' };
  }
  
  const sheet = getOrCreateStudentGradesSheet();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  const userIdCol = headers.indexOf('userId');
  const subjectsCol = headers.indexOf('subjectsJson');
  
  // Find user's grades
  let subjects = [];
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][userIdCol]) === String(data.userId)) {
      try {
        subjects = JSON.parse(allData[i][subjectsCol]) || [];
      } catch (e) {
        subjects = [];
      }
      break;
    }
  }
  
  if (subjects.length === 0) {
    return { 
      success: true, 
      stats: { 
        averageScore: 0, 
        subjectCount: 0, 
        filledSemesters: 0, 
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        semesterAverages: [null, null, null, null, null]
      } 
    };
  }
  
  // Calculate statistics
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const semesterSums = [0, 0, 0, 0, 0];
  const semesterCounts = [0, 0, 0, 0, 0];
  let totalSum = 0;
  let totalCount = 0;
  
  subjects.forEach(function(sub) {
    const semValues = [sub.sem1, sub.sem2, sub.sem3, sub.sem4, sub.sem5];
    let subjectSum = 0;
    let subjectCount = 0;
    
    semValues.forEach(function(val, idx) {
      if (val !== null && val !== undefined && val > 0) {
        semesterSums[idx] += val;
        semesterCounts[idx]++;
        subjectSum += val;
        subjectCount++;
      }
    });
    
    // Calculate subject average for grade distribution
    if (subjectCount > 0) {
      const avg = subjectSum / subjectCount;
      totalSum += avg;
      totalCount++;
      
      // Assign grade
      const grade = getGradeForScore(avg);
      if (gradeDistribution[grade] !== undefined) {
        gradeDistribution[grade]++;
      }
    }
  });
  
  // Calculate averages
  const averageScore = totalCount > 0 ? totalSum / totalCount : 0;
  const semesterAverages = semesterSums.map(function(sum, idx) {
    return semesterCounts[idx] > 0 ? sum / semesterCounts[idx] : null;
  });
  const filledSemesters = semesterCounts.filter(function(c) { return c > 0; }).length;
  
  return {
    success: true,
    stats: {
      averageScore: Math.round(averageScore * 100) / 100,
      subjectCount: subjects.length,
      filledSemesters: filledSemesters,
      gradeDistribution: gradeDistribution,
      semesterAverages: semesterAverages.map(function(v) { 
        return v !== null ? Math.round(v * 100) / 100 : null; 
      })
    }
  };
}

/**
 * Helper: Get grade letter from score
 */
function getGradeForScore(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

