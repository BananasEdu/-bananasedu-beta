/**
 * BananasEdu Backend - Google Apps Script
 * Deploy this as a Web App with access: "Anyone"
 */

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const params = e.parameter;
    const action = params.action;

    let result = {};

    try {
        switch (action) {
            case 'login':
                result = handleLogin(params.nis, params.password);
                break;
            case 'getStudent':
                result = getStudentData(params.nis);
                break;
            case 'getGrades':
                result = getStudentGrades(params.nis);
                break;
            default:
                result = { success: false, message: 'Invalid action' };
        }
    } catch (err) {
        result = { success: false, message: err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// === AUTH ===
function handleLogin(nis, password) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove headers

    // Columns: NIS (0), Name (1), Password (2), Role (3), Class (4)
    const user = data.find(row => row[0].toString() === nis.toString());

    if (!user) return { success: false, message: 'User not found' };
    if (user[2].toString() !== password) return { success: false, message: 'Invalid password' };

    return {
        success: true,
        data: {
            nis: user[0],
            name: user[1],
            role: user[3],
            kelas: user[4]
        }
    };
}

// === DATA ===
function getStudentData(nis) {
    // Can fetch more profile details here if needed
    return { success: true, message: 'Data fetched' };
}

function getStudentGrades(nis) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Grades');
    const data = sheet.getDataRange().getValues();
    data.shift();

    // Columns: NIS (0), Semester (1), Subject (2), Score (3), Grade (4)
    const grades = data.filter(row => row[0].toString() === nis.toString())
        .map(row => ({
            semester: row[1],
            subject: row[2],
            score: row[3],
            grade: row[4]
        }));

    return { success: true, data: grades };
}

// === SETUP ===
function setupSheets() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss.getSheetByName('Users')) {
        const s = ss.insertSheet('Users');
        s.appendRow(['NIS', 'Name', 'Password', 'Role', 'Class']);
        // Demo User
        s.appendRow(['12345', 'Andi Siswa', 'password', 'student', '12 IPA 1']);
    }

    if (!ss.getSheetByName('Grades')) {
        const s = ss.insertSheet('Grades');
        s.appendRow(['NIS', 'Semester', 'Subject', 'Score', 'Grade']);
        // Demo Grades
        s.appendRow(['12345', 'S5', 'Matematika', 92.5, 'A']);
        s.appendRow(['12345', 'S5', 'Fisika', 88.0, 'B']);
    }
}
