const supabase = require('../config/supabase');

// get all reports
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbreport_files')
      .select('*'); // eksplisit, aman

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message,
    });
  }
};

// get report by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbreport_files')
      .select('*')
      .eq('rfid', id)
      .single();

    if (error) {
      // Supabase akan beri error untuk .single() saat tidak ada row
      // Tangani 404 dengan aman
      if (error.code === 'PGRST116' || error.message?.toLowerCase().includes('no rows')) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message,
    });
  }
};
