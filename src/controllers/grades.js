const supabase = require('../config/supabase');
const { grade: select } = require('../helper/fields');
const { grade: payload } = require('../helper/payload');
const reports = require('../models/reports');
const {grade} = require('../helper/whatsapp');
const bucket = "reports";
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbgrade')
      .select(select);

    if (error) throw error;

    return res.json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbgrade')
      .select(select)
      .eq('studentid', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

//insert new student grade
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);
    const file = req.file;

    if (!insert.test_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Test type are required for a new grade' 
      });
    }

    //insert new grade into table
    const { data, error } = await supabase
      .from('tbgrade')
      .insert(insert)
      .select();

    if(error) throw error;
    let uploaded = []

    //upload files
    if(file) {
      results = await reports.create(data[0], file, bucket);
      uploaded.push(results);
    };

    return res.status(201).json({
      success: true,
      data,
      uploaded
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating new grade',
      error: error.message
    });
  }
};


// Update data lecturer
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    const file = req.file;

    // update grade
    const { data, error } = await supabase
      .from('tbgrade')
      .update(insert)
      .eq('gradeid', id)
      .select();

    if (error) throw error;
    let uploaded = [];

    //find or upload
    if (file) {
      const results = await reports.createOrReplace(data[0], file, bucket);
      uploaded.push(results);
    };

    return res.status(201).json({
      success: true,
      data,
      uploaded
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
};

//remove student grade record
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tbgrade')
      .delete()
      .eq('gradeid', id)
      .select(select);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'student/grade not found.'
      });
    }

    const file = data[0].tbreport_files;

    //remove files from bucket
    if(file) await reports.delete(file[0], bucket);

    return res.status(200).json({
      success: true,
      message: `students grade id: ${id} hard deleted successfully`

    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting students grade',
      error: error.message
    });
  }
};

// Download PDF certificate for a grade
exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch grade data with student information
    const { data, error } = await supabase
      .from('tbgrade')
      .select(`
        gradeid,
        test_type,
        listening_score,
        speaking_score,
        reading_score,
        writing_score,
        final_score,
        date_taken,
        tbstudent!inner(
          fullname
        )
      `)
      .eq('gradeid', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Calculate average score
    const scores = [
      data.listening_score,
      data.speaking_score,
      data.reading_score,
      data.writing_score
    ].filter(s => s !== null && s !== undefined);
    
    const averageScore = scores.length > 0 
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 'N/A';

    // Create PDF document in landscape mode
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Set response headers for file download
    const fileName = `Certificate_${data.tbstudent.fullname.replace(/\s+/g, '_')}_${data.test_type || 'Test'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Load and place certificate template image
    const templatePath = path.join(__dirname, '../assets/certificate_template.png');
    
    // Check if template exists
    if (fs.existsSync(templatePath)) {
      // Get A4 landscape dimensions (842 x 595 points)
      doc.image(templatePath, 0, 0, { width: 842, height: 595 });
    } else {
      // Fallback: create basic certificate design if template is missing
      doc.rect(0, 0, 842, 595).fill('#f8f9fa');
      doc.rect(40, 40, 762, 515).strokeColor('#2563eb').lineWidth(3).stroke();
      doc.rect(50, 50, 742, 495).strokeColor('#3b82f6').lineWidth(1).stroke();
    }

    // Add text overlay - Student Name (Center, Large)
    doc.fontSize(32)
       .fillColor('#1e293b')
       .font('Helvetica-Bold')
       .text(data.tbstudent.fullname, 0, 200, {
         width: 842,
         align: 'center'
       });

    // Test Type
    doc.fontSize(18)
       .fillColor('#475569')
       .font('Helvetica')
       .text(`${data.test_type || 'English Proficiency Test'}`, 0, 260, {
         width: 842,
         align: 'center'
       });

    // Scores Section
    const scoresY = 320;
    doc.fontSize(14)
       .fillColor('#334155')
       .font('Helvetica-Bold');

    // Score labels and values in a row
    const scoreX = 200;
    const spacing = 130;

    doc.text('Listening:', scoreX, scoresY);
    doc.font('Helvetica').text(data.listening_score ?? '-', scoreX + 70, scoresY);

    doc.font('Helvetica-Bold').text('Speaking:', scoreX + spacing, scoresY);
    doc.font('Helvetica').text(data.speaking_score ?? '-', scoreX + spacing + 70, scoresY);

    doc.font('Helvetica-Bold').text('Reading:', scoreX + spacing * 2, scoresY);
    doc.font('Helvetica').text(data.reading_score ?? '-', scoreX + spacing * 2 + 70, scoresY);

    doc.font('Helvetica-Bold').text('Writing:', scoreX + spacing * 3, scoresY);
    doc.font('Helvetica').text(data.writing_score ?? '-', scoreX + spacing * 3 + 70, scoresY);

    // Final Score (Prominent)
    doc.fontSize(20)
       .fillColor('#2563eb')
       .font('Helvetica-Bold')
       .text(`Final Score: ${averageScore}`, 0, scoresY + 50, {
         width: 842,
         align: 'center'
       });

    // Date Taken
    const dateText = data.date_taken 
      ? new Date(data.date_taken).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Date not recorded';

    doc.fontSize(12)
       .fillColor('#64748b')
       .font('Helvetica')
       .text(`Date: ${dateText}`, 0, scoresY + 100, {
         width: 842,
         align: 'center'
       });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating certificate:', error);
    
    // If headers not sent, send error response
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Error generating certificate',
        error: error.message
      });
    }
  }
}; 