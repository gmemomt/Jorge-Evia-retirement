// Google Apps Script for RSVP Form Submission
// This script will handle form submissions and store data in Google Sheets

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    const sheet = getOrCreateSheet();
    
    // Add the data to the sheet
    const result = addRSVPToSheet(sheet, data);
    
    // Send confirmation email to the guest
    sendConfirmationEmail(data);
    
    // Send notification email to you (optional)
    sendNotificationEmail(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'RSVP submitted successfully',
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing RSVP:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error submitting RSVP: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const SHEET_NAME = 'Jorge Evia Retirement RSVPs';
  
  // Try to get existing spreadsheet
  let spreadsheet;
  const files = DriveApp.getFilesByName(SHEET_NAME);
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    // Create new spreadsheet
    spreadsheet = SpreadsheetApp.create(SHEET_NAME);
  }
  
  let sheet = spreadsheet.getActiveSheet();
  
  // Check if headers exist, if not, create them
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Name',
      'Email',
      'Attendance',
      'Number of Guests',
      'Message',
      'Language',
      'IP Address',
      'User Agent'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#667eea');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(12);
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 200); // Name
    sheet.setColumnWidth(3, 250); // Email
    sheet.setColumnWidth(4, 120); // Attendance
    sheet.setColumnWidth(5, 120); // Guests
    sheet.setColumnWidth(6, 300); // Message
    sheet.setColumnWidth(7, 100); // Language
    sheet.setColumnWidth(8, 120); // IP
    sheet.setColumnWidth(9, 200); // User Agent
  }
  
  return sheet;
}

function addRSVPToSheet(sheet, data) {
  const timestamp = new Date();
  const row = [
    timestamp,
    data.name || '',
    data.email || '',
    data.attendance || '',
    data.guests || '',
    data.message || '',
    data.language || 'en',
    data.ipAddress || '',
    data.userAgent || ''
  ];
  
  // Add the row to the sheet
  sheet.appendRow(row);
  
  // Get the row number that was just added
  const lastRow = sheet.getLastRow();
  
  // Format the new row
  const range = sheet.getRange(lastRow, 1, 1, row.length);
  
  // Alternate row colors
  if (lastRow % 2 === 0) {
    range.setBackground('#f8f9fa');
  }
  
  // Format attendance column with colors
  const attendanceCell = sheet.getRange(lastRow, 4);
  if (data.attendance === 'yes') {
    attendanceCell.setBackground('#d4edda');
    attendanceCell.setFontColor('#155724');
  } else if (data.attendance === 'no') {
    attendanceCell.setBackground('#f8d7da');
    attendanceCell.setFontColor('#721c24');
  }
  
  return {
    row: lastRow,
    timestamp: timestamp,
    success: true
  };
}

function sendConfirmationEmail(data) {
  try {
    const subject = getEmailSubject(data.language);
    const body = getConfirmationEmailBody(data);
    
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: body
    });
    
    console.log('Confirmation email sent to:', data.email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

function sendNotificationEmail(data) {
  try {
    // Replace with your email address
    const YOUR_EMAIL = 'your-email@example.com'; // ⚠️ CHANGE THIS TO YOUR EMAIL
    
    const subject = `New RSVP: ${data.name} - Jorge Evia Retirement`;
    const body = `
      <h3>New RSVP Received</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Attendance:</strong> ${data.attendance}</p>
      <p><strong>Guests:</strong> ${data.guests}</p>
      <p><strong>Language:</strong> ${data.language}</p>
      <p><strong>Message:</strong> ${data.message || 'No message'}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      
      <p><a href="https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}">View All RSVPs</a></p>
    `;
    
    MailApp.sendEmail({
      to: YOUR_EMAIL,
      subject: subject,
      htmlBody: body
    });
    
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

function getEmailSubject(language) {
  const subjects = {
    'en': 'RSVP Confirmation - Jorge Evia\'s Retirement Celebration',
    'es': 'Confirmación de RSVP - Celebración de Jubilación de Jorge Evia',
    'zh': 'RSVP確認 - Jorge Evia退休慶祝活動'
  };
  
  return subjects[language] || subjects['en'];
}

function getConfirmationEmailBody(data) {
  const templates = {
    'en': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 2rem;">✈️ Thank You!</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">RSVP Confirmation</p>
        </div>
        
        <div style="padding: 2rem; background: white;">
          <p>Dear ${data.name},</p>
          
          <p>Thank you for your RSVP to Captain Jorge Evia's retirement celebration!</p>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h3 style="margin-top: 0; color: #667eea;">Event Details:</h3>
            <p><strong>Date:</strong> August 16th, 2024</p>
            <p><strong>Time:</strong> 11:00 AM</p>
            <p><strong>Venue:</strong> 緣圓餐廳 (3rd Floor)</p>
            <p><strong>Address:</strong> No. 846, Zhongzheng Rd, Taoyuan District, Taoyuan City</p>
          </div>
          
          <div style="background: #e8f4fd; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h3 style="margin-top: 0; color: #667eea;">Your RSVP Details:</h3>
            <p><strong>Attendance:</strong> ${data.attendance === 'yes' ? 'Yes, I\'ll be there! 🎉' : 'Sorry, I can\'t make it 😔'}</p>
            <p><strong>Number of Guests:</strong> ${data.guests}</p>
            ${data.message ? `<p><strong>Your Message:</strong> ${data.message}</p>` : ''}
          </div>
          
          ${data.attendance === 'yes' ? `
            <p>We're excited to celebrate with you! Please save the date and let us know if you have any questions.</p>
            
            <div style="text-align: center; margin: 2rem 0;">
              <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Jorge%20Evia%27s%20Retirement%20Celebration&dates=20240816T110000/20240816T150000&details=Retirement%20celebration%20lunch%20for%20Captain%20Jorge%20Evia&location=緣圓餐廳%2C%203rd%20Floor%2C%20No.%20846%2C%20Zhongzheng%20Rd%2C%20Taoyuan%20District%2C%20Taoyuan%20City" 
                 style="background: #667eea; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 25px; display: inline-block;">
                📅 Add to Calendar
              </a>
            </div>
          ` : `
            <p>We're sorry you can't make it, but we appreciate you letting us know. You'll be missed!</p>
          `}
          
          <p>Best regards,<br>
          <strong>Jorge Evia</strong><br>
          Captain</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 1rem; text-align: center; font-size: 0.9rem; color: #6c757d;">
          <p>This is an automated confirmation email for Jorge Evia's retirement celebration.</p>
        </div>
      </div>
    `,
    
    'es': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 2rem;">✈️ ¡Gracias!</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">Confirmación de RSVP</p>
        </div>
        
        <div style="padding: 2rem; background: white;">
          <p>Estimado/a ${data.name},</p>
          
          <p>¡Gracias por confirmar su asistencia a la celebración de jubilación del Capitán Jorge Evia!</p>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h3 style="margin-top: 0; color: #667eea;">Detalles del Evento:</h3>
            <p><strong>Fecha:</strong> 16 de agosto, 2024</p>
            <p><strong>Hora:</strong> 11:00 h</p>
            <p><strong>Lugar:</strong> 緣圓餐廳 (Tercer piso)</p>
            <p><strong>Dirección:</strong> N.° 846, Zhongzheng Rd, distrito de Taoyuan, ciudad de Taoyuan</p>
          </div>
          
          <div style="background: #e8f4fd; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h3 style="margin-top: 0; color: #667eea;">Sus Detalles de RSVP:</h3>
            <p><strong>Asistencia:</strong> ${data.attendance === 'yes' ? '¡Sí, estaré allí! 🎉' : 'Lo siento, no podré asistir 😔'}</p>
            <p><strong>Número de Invitados:</strong> ${data.guests}</p>
            ${data.message ? `<p><strong>Su Mensaje:</strong> ${data.message}</p>` : ''}
          </div>
          
          <p>Saludos cordiales,<br>
          <strong>Jorge Evia</strong><br>
          Capitán</p>
        </div>
      </div>
    `,
    
    'zh': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 2rem;">✈️ 謝謝您！</h1>
          <p style="margin: 0.5rem 0 0 0; font-size: 1.1rem;">RSVP確認</p>
        </div>
        
        <div style="padding: 2rem; background: white;">
          <p>親愛的 ${data.name}，</p>
          
          <p>感謝您確認參加Jorge Evia機長的退休慶祝活動！</p>
          
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h3 style="margin-top: 0; color: #667eea;">活動詳情：</h3>
            <p><strong>日期：</strong> 2024年8月16日</p>
            <p><strong>時間：</strong> 上午11點</p>
            <p><strong>地點：</strong> 緣圓餐廳 (三樓)</p>
            <p><strong>地址：</strong> 桃園市桃園區中正路846號</p>
          </div>
          
          <p>谢谢，<br>
          <strong>Jorge Evia</strong><br>
          機長</p>
        </div>
      </div>
    `
  };
  
  return templates[data.language] || templates['en'];
}

// Test function (optional)
function testFunction() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    attendance: 'yes',
    guests: '2',
    message: 'Looking forward to it!',
    language: 'en'
  };
  
  const sheet = getOrCreateSheet();
  addRSVPToSheet(sheet, testData);
  console.log('Test completed successfully');
}
