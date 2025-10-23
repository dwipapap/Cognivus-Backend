const supabase = require('../config/supabase');
const { grade: select } = require('../helper/fields');
const { grade: payload } = require('../helper/payload');
const reports = require('../models/reports');
const bucket = 'reports';

exports.getAll = async (req, res) => {
  try {
    const from = await supabase.from('tbgrade');
    const { data, error } = await from.select(select);
    if (error) throw error;

    return res.json({ success: true, data });
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
    const from = await supabase.from('tbgrade');
    const { data, error } = await from.select(select).eq('studentid', id);
    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

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

    const from = await supabase.from('tbgrade');
    const { data, error } = await from.insert(insert).select();
    if (error) throw error;

    const uploaded = [];
    if (file) {
      const created = await reports.create(data[0], file, bucket);
      uploaded.push(created);
    }

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

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const insert = payload(req.body);
    const file = req.file;

    const from = await supabase.from('tbgrade');
    const { data, error } = await from.update(insert).eq('gradeid', id).select();
    if (error) throw error;

    const uploaded = [];
    if (file && file.length > 0) {
      const results = await reports.createOrReplace(data[0], file, bucket);
      uploaded.push(results);
    }

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

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const from = await supabase.from('tbgrade');
    const { data, error } = await from.delete().eq('gradeid', id).select(select);
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'student/grade not found.'
      });
    }

    const file = data[0].tbreport_files;
    if (file) await reports.delete(file[0], bucket);

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
