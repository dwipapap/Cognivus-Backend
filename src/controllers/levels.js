// src/controllers/levels.js
const supabase = require('../config/supabase');
const { level: payload } = require('../helper/payload');
const { level: select } = require('../helper/fields');

// Get all levels
exports.getAll = async (req, res) => {
  try {
    const { data, error } = await supabase.from('tblevel').select(select);
    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching levels',
      error: error.message,
    });
  }
};

// Get level by id
exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('tblevel')
      .select(select)
      .eq('levelid', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching level',
      error: error.message,
    });
  }
};

// Create new level
exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);

    const { data, error } = await supabase
      .from('tblevel')
      .insert(insert)
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating level',
      error: error.message,
    });
  }
};

// Update level
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);

    const { data, error } = await supabase
      .from('tblevel')
      .update(insert)
      .eq('levelid', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Level not found.' });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating level',
      error: error.message,
    });
  }
};

// Delete level
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Select deleted rows to know if something was deleted
    const { data, error } = await supabase
      .from('tblevel')
      .delete()
      .eq('levelid', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Level not found.' });
    }

    res.json({ success: true, message: 'level deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting level',
      error: error.message,
    });
  }
};
