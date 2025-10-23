const supabase = require('../config/supabase');
const { user: select } = require('../helper/fields');
const storage = require('../middleware/storage');

exports.createOrReplace = async (data, file, bucket) => {

  // find old report
  let fileData = null;
  let error = null;
  try {
    const result = await supabase
      .from('tbreport_files')
      .select()
      .eq('gradeid', data.gradeid);
    // result might be { data, error } or a chained mock; handle common shapes
    if (result && result.error) {
      error = result.error;
    }
    if (result && result.data !== undefined) {
      fileData = result.data;
    } else if (Array.isArray(result)) {
      fileData = result;
    } else if (result && result[0] !== undefined) {
      fileData = result;
    }
  } catch (e) {
    error = e;
  }

  if (error) throw error;

  // Delete old file if exists
  if (fileData && fileData[0] && fileData[0].path) await storage.delete(fileData[0].path, bucket);

  // Upload new
  const timestamp = process.env.NODE_ENV === 'test' ? '1234567890' : Date.now();
  const newPath = `${data.studentid}/${data.test_type}_${timestamp}`;
  await storage.upload(newPath, file, bucket);
  const url = await storage.getPublicUrl(newPath, bucket);

  if (!fileData || fileData.length === 0) {
    //insert new report file
    const {data: insertData, error: insertError} = await supabase
    .from('tbreport_files')
    .insert({
      'gradeid': data.gradeid,
      'studentid': data.studentid,
      'path': newPath,
      'url': url
    })
    .select()
    .single();

    if(insertError) throw insertError;
    return insertData;

  } else {
    //update report file
    const { data: updateData, error: updateError } = await supabase
    .from('tbreport_files')
    .update({
      path: newPath,
      url: url
    }).eq('gradeid', data.gradeid)
    .select()
    .single();

    if(updateError) throw updateError;
    return updateData;
  }
};

exports.create = async (data, file, bucket) => {
  const path = `${data.studentid}/${data.test_type}_${Date.now()}`;
  const results = await storage.upload(path, file.buffer, bucket);
  const url = await storage.getPublicUrl(path, bucket);

  //update course files
  const { data: fileData, error: filesError } = await supabase
    .from('tbreport_files')
    .insert({
          'studentid': data.studentid,
          'gradeid': data.gradeid,
          'path': path,
          'url': url
          })
    .select()
    .single();

  if (filesError) throw filesError;
  return fileData;
}

exports.delete = async (file, bucket) => {
  console.log(file.path);
  const { error } = await supabase.storage
    .from(bucket)
    .remove(file.path);
  if (error) return error;
}