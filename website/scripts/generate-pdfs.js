import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// -------------------------------------------------------------
// PDF 1: NIT Upload Request Form.pdf
// -------------------------------------------------------------
function generatePdf1() {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = fs.createWriteStream(path.join(publicDir, 'NIT Upload Request Form.pdf'));
  doc.pipe(stream);

  // Title
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000')
     .text('Jammu and Kashmir State Power Development Corporation Limited', { align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(16)
     .text('NIT UPLOAD REQUEST', { align: 'center', underline: true });
  doc.moveDown(0.8);

  doc.font('Helvetica').fontSize(10).fillColor('#000000')
     .text('The following needs to be filled and the file sent to ', { continued: true })
     .fillColor('#0000FF')
     .text('webupdates@jkspdcl.com.', { link: 'mailto:webupdates@jkspdcl.com', underline: true });
  doc.font('Helvetica').fillColor('#000000');
  doc.moveDown(0.8);

  // Table Data
  const fields = [
    { num: '1', title: 'Requesting authority', sub: '(e.g. XEN CID Kashmir, XEN GEN UDHM, etc)' },
    { num: '2', title: 'Type of file to upload', sub: '(Tender Doc/NIT/e-NIT Gist/Quotation/Corrigendum)' },
    { num: '3', title: 'Number and Date of NIT', sub: '(NIT no. in case of tender)' },
    { num: '4', title: 'Description of Work', sub: '(in case of Tender/NIT)' },
    { num: '5', title: 'Associated e-tender id', sub: '(if applicable)' },
    { num: '6', title: 'Type of Work', sub: '(Civil/Mechanical/Electrical/Hydro Mechanical/Electromechanical/IT/PMC/Geological, etc)' },
    { num: '7', title: 'Name of the project', sub: '(BHEP, LJHP, Sawalkote, etc)' },
    { num: '8', title: 'Location of Work', sub: '(Physical location of work)' },
    { num: '9', title: 'Cost of work', sub: '(In case of tenders)' },
    { num: '10', title: 'Time of completion', sub: '(mention in days)' },
    { num: '11', title: 'Date of upload requested', sub: '' },
  ];

  let startY = doc.y;
  const startX = 40;
  const col1Width = 30;
  const col2Width = 240;
  const col3Width = 240;

  fields.forEach((f) => {
    const rowHeight = f.sub ? 34 : 26;
    
    // Draw cells border
    doc.rect(startX, startY, col1Width, rowHeight).stroke('#000000');
    doc.rect(startX + col1Width, startY, col2Width, rowHeight).stroke('#000000');
    doc.rect(startX + col1Width + col2Width, startY, col3Width, rowHeight).stroke('#000000');

    // Col 1 text
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000')
       .text(f.num, startX + 5, startY + 6, { width: col1Width - 10, align: 'center' });

    // Col 2 text
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000')
       .text(f.title, startX + col1Width + 6, startY + 4, { width: col2Width - 12 });
    if (f.sub) {
      doc.font('Helvetica').fontSize(8.5).fillColor('#CC0000')
         .text(f.sub, startX + col1Width + 6, startY + 17, { width: col2Width - 12 });
    }

    startY += rowHeight;
  });

  doc.y = startY + 15;
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text('INSTRUCTIONS', { underline: true });
  doc.moveDown(0.5);

  const instructions = [
    'Only requests originating from official email id of the JKSPDCL officials will be accepted and uploaded in the relevant section of the website.',
    'Only pdf files will be accepted.',
    'Requests without this form will be rejected and files would not be uploaded.'
  ];

  instructions.forEach((inst) => {
    doc.font('Helvetica').fontSize(10).fillColor('#000000')
       .text(`•  ${inst}`, { indent: 10, lineGap: 4 });
  });

  doc.end();
  console.log('Generated NIT Upload Request Form.pdf');
}

// -------------------------------------------------------------
// PDF 2: JKTenders User ID Creation Form.pdf
// -------------------------------------------------------------
function generatePdf2() {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = fs.createWriteStream(path.join(publicDir, 'User Creation.pdf'));
  doc.pipe(stream);

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000')
     .text('DETAILS TO BE FILLED FOR THE CREATION OF USER ID AND PASSWORD IN JKTENDERS.GOV.IN WEBSITE FOR USE OF E-TENDERING SYSTEM.', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#FF0000')
     .text('(BEFORE FILLING IN THE FORM PLEASE READ THE INSTRUCTIONS BELOW)', { align: 'center' });
  doc.moveDown(0.8);

  const startX = 40;
  let startY = doc.y;
  const col1Width = 40;
  const col2Width = 260;
  const col3Width = 210;

  // Header Row
  doc.rect(startX, startY, col1Width, 20).fillAndStroke('#F0F0F0', '#000000');
  doc.rect(startX + col1Width, startY, col2Width, 20).fillAndStroke('#F0F0F0', '#000000');
  doc.rect(startX + col1Width + col2Width, startY, col3Width, 20).fillAndStroke('#F0F0F0', '#000000');

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000');
  doc.text('SNO', startX + 5, startY + 5, { width: col1Width - 10, align: 'center' });
  doc.text('Information Needed', startX + col1Width + 6, startY + 5, { width: col2Width - 12 });
  doc.text('Fill in this column', startX + col1Width + col2Width + 6, startY + 5, { width: col3Width - 12 });
  startY += 20;

  const rows = [
    { sno: '1', name: 'Department e.g. CE Generation Kashmir, CPE, etc' },
    { sno: '2', name: 'Division' },
    { sno: '3', name: 'Subdivision' },
    { sno: '4*', name: 'Title(Mr, Mrs, etc)' },
    { sno: '5*', name: 'First Name' },
    { sno: '6*', name: 'Last Name' },
    { sno: '7*', name: 'Date of Birth in DD-MM-YYYY' },
    { sno: '8*', name: 'Email ID (Personal)' },
    { sno: '9*', name: 'Alternate Email ID (Personal)' },
    { sno: '10*', name: 'Designation' },
    { sno: '11*', name: 'Contact Address(Full) and personal only' },
    { sno: '12*', name: 'Correspondence Email Id(can be same as 8 above)' },
    { sno: '13*', name: 'Phone Number (Landline)' },
    { sno: '14', name: 'Fax Number' },
    { sno: '15*', name: 'Cell Number' },
  ];

  rows.forEach((r) => {
    const rowHeight = 16;
    doc.rect(startX, startY, col1Width, rowHeight).stroke('#000000');
    doc.rect(startX + col1Width, startY, col2Width, rowHeight).stroke('#000000');
    doc.rect(startX + col1Width + col2Width, startY, col3Width, rowHeight).stroke('#000000');

    doc.font('Helvetica').fontSize(9).fillColor('#000000');
    doc.text(r.sno, startX + 5, startY + 4, { width: col1Width - 10, align: 'center' });
    doc.text(r.name, startX + col1Width + 6, startY + 4, { width: col2Width - 12 });
    startY += rowHeight;
  });

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
     .text('All items with * are mandatory.', startX, startY + 4);
  startY += 18;

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('INSTRUCTIONS:', startX, startY);
  startY += 14;

  const instructions = [
    'Please provide the detail in soft copy by updating this document and DONOT SEND SCANNED COPY.',
    'You should provide accurate and correct information.',
    'You should only provide PERSONAL email id and ids like cebhep@gmail.com, cpekargil@gmail.com will not be accepted. Digital signature is a private asset and not tied to a post. We only map you to allow your digital signature to be used for tendering and when you get transferred or retired you don’t return the digital signature to JKSPDC and therefore only personal email ids will be required.',
    'All fields with the asterisk (*) are mandatory and forms with incomplete information will not be processed.',
    'Please give 1-2 working days for creation of the user id.',
    'Make sure you are already in possession of valid, class –II , encryption and signing digital certificate before applying for id.',
    'We are not responsible for setting up your system to be compatible with digital signature. You would have to take care of installing the requisite java, antivirus, drivers softwares on your systems on your own.',
    'The only email id for contacting e-tendering related issues is webupdates@jkspdcl.com',
    'For any system related issues you can contact NIC e-tendering team at jktenders@nic.in or etender@nic.in',
    'For any other system issues related to e-tendering please visit jktenders.gov.in or call their help desk details of which are available on their website.'
  ];

  doc.y = startY;
  instructions.forEach((inst, idx) => {
    doc.font('Helvetica').fontSize(8).fillColor('#000000')
       .text(`${idx + 1}.  ${inst}`, { indent: 5, lineGap: 2 });
  });

  doc.end();
  console.log('Generated JKTenders User ID Creation Form.pdf');
}

generatePdf1();
generatePdf2();
