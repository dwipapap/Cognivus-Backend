const supabase = require('../config/supabase');
const { course: select } = require('../helper/fields.js');
const { course: payload } = require('../helper/payload.js');
const courses = require('../models/course.js');
const bucket = 'courses';

exports.getAll = async (req, res) => {
  try {
    const from = await supabase.from('tbcourse');
    const { data, error } = await from.select(select);
    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const from = await supabase.from('tbcourse');
    const { data, error } = await from.select(select).eq('courseid', id).single();
    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

exports.create = async (req, res) => {
  try {
    const insert = payload(req.body);
    const files = req.files;

    if (!insert.title) {
      return res.status(400).json({
        success: false,
        message: 'Title are required for a new course'
      });
    }

    const from = await supabase.from('tbcourse');
    const { data, error } = await from.insert(insert).select();
    if (error) throw error;

    const results = [];
    if (files) {
      for (const file of files) {
        const courseFile = await courses.create(data[0], file, bucket);
        results.push(courseFile);
      }
    }

    return res.status(201).json({
      success: true,
      // unit test mengharapkan single row, bukan array
      data: data[0],
      files: results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const insert = payload(req.body);

    const from = await supabase.from('tbcourse');
    const { data, error } = await from.update(insert).eq('courseid', id).select(select);
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const results = [];
    if (files) {
      for (const file of files) {
        const courseFile = await courses.create(data[0], file, bucket);
        results.push(courseFile);
      }
    }

    return res.status(201).json({
      success: true,
      // unit test mengharapkan single row
      data: data[0],
      files: results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const from = await supabase.from('tbcourse');
    const { data, error } = await from.delete().eq('courseid', id).select(select);
    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const files = data[0].tbcourse_files;
    if (files) {
      for (const file of files) await courses.delete(file, bucket);
    }

    return res.json({
      success: true,
      message: `Course id: ${id} hard deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};
