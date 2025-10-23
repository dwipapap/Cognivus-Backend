const supabase = require('../config/supabase');
const { program: payload } = require('../helper/payload');
const { program: selectFields } = require('../helper/fields');

// read all program data
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbprogram')
      .select(selectFields);

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching programs',
      error: error.message,
    });
  }
};

// read program by id
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('tbprogram')
      .select(selectFields)
      .eq('programid', id)
      .single(); // tepat karena by id

    if (error) throw error;

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    const status = error.code === 'PGRST116' ? 404 : 500; // tidak ditemukan -> 404
    return res.status(status).json({
      success: false,
      message: status === 404 ? 'Program not found' : 'Error fetching program',
      error: error.message,
    });
  }
};

// insert new program
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);

    const { data, error } = await supabase
      .from('tbprogram')
      .insert(insert)
      .select(selectFields)
      .single(); // langsung objek

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating program',
      error: error.message,
    });
  }
};

// update program data
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const changes = payload(req.body);

    const { data, error } = await supabase
      .from('tbprogram')
      .update(changes)
      .eq('programid', id)
      .select(selectFields)
      .maybeSingle(); // null jika tidak ada baris

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating program',
      error: error.message,
    });
  }
};

// delete program
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // gunakan select agar tahu ada baris yang terhapus
    const { data, error } = await supabase
      .from('tbprogram')
      .delete()
      .eq('programid', id)
      .select('programid')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    return res.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting program',
      error: error.message,
    });
  }
};
