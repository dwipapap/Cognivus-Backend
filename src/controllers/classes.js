// controllers/classes.js
const supabase = require('../config/supabase');
const { class: buildPayload } = require('../helper/payload.js');
const { class: select } = require('../helper/fields.js');

exports.getAll = async (req, res) => {
  try {
    const { lecturerid } = req.query || {};
    let query = supabase.from('tbclass').select(select);
    if (lecturerid) {
      query = query.eq('lecturerid', lecturerid);
    }
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching classes', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { data, error } = await supabase.from('tbclass').select(select).eq('classid', id).single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(404).json({ success: false, message: 'Class not found', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = buildPayload(req.body || {});
    const { data, error } = await supabase.from('tbclass').insert(payload).select(select).single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creating class', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params || {};
    const payload = buildPayload(req.body || {});
    const { data, error } = await supabase.from('tbclass').update(payload).eq('classid', id).select(select).single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating class', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { data, error } = await supabase.from('tbclass').delete().eq('classid', id).select('classid').single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting class', error: error.message });
  }
};
