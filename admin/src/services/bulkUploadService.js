import api from './api';

const bulkUploadService = {
  // Download Excel template
  downloadTemplate: async () => {
    const response = await api.get('/menu/bulk-upload/template', {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'menu_bulk_upload_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Upload bulk data file
  uploadFile: async (file, updateExisting = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('updateExisting', updateExisting);

    const response = await api.post(
      '/menu/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};

export default bulkUploadService;
