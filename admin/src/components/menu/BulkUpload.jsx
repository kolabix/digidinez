import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from '../common/Toast';
import bulkUploadService from '../../services/bulkUploadService';

export const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(rejection => {
        if (rejection.errors.some(error => error.code === 'file-too-large')) {
          return 'File size must be less than 10MB';
        }
        if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
          return 'Please select a valid Excel (.xlsx, .xls) or CSV file';
        }
        return 'File rejected';
      });
      setErrors(rejectionReasons);
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setErrors([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setErrors(['Please select a valid Excel (.xlsx, .xls) or CSV file']);
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors(['File size must be less than 10MB']);
        return;
      }

      setFile(selectedFile);
      setErrors([]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      await bulkUploadService.downloadTemplate();
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrors(['Please select a file to upload']);
      return;
    }

    try {
      setIsUploading(true);
      setErrors([]);
      setUploadResults(null);

      const result = await bulkUploadService.uploadFile(file, updateExisting);
      setUploadResults(result.data);
      toast.success('Bulk upload completed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Upload failed';
      const errorDetails = error.response?.data?.errors || [];
      setErrors([errorMessage, ...errorDetails]);
      toast.error('Bulk upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUpdateExisting(false);
    setUploadResults(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadResults = () => {
    if (!uploadResults) return null;

    const { summary, details } = uploadResults;

    return (
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h3>
        
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Created</p>
                <p className="text-2xl font-bold text-green-900">{summary.totalCreated}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ArrowUpTrayIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Updated</p>
                <p className="text-2xl font-bold text-blue-900">{summary.totalUpdated}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Errors</p>
                <p className="text-2xl font-bold text-red-900">{summary.totalErrors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          {/* Categories */}
          {details.categories && (details.categories.created > 0 || details.categories.updated > 0 || details.categories.errors.length > 0) && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
              <div className="text-sm text-gray-600">
                <p>Created: {details.categories.created} | Updated: {details.categories.updated}</p>
                {details.categories.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {details.categories.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {details.tags && (details.tags.created > 0 || details.tags.updated > 0 || details.tags.errors.length > 0) && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="text-sm text-gray-600">
                <p>Created: {details.tags.created} | Updated: {details.tags.updated}</p>
                {details.tags.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {details.tags.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Items */}
          {details.menuItems && (details.menuItems.created > 0 || details.menuItems.updated > 0 || details.menuItems.errors.length > 0) && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Menu Items</h4>
              <div className="text-sm text-gray-600">
                <p>Created: {details.menuItems.created} | Updated: {details.menuItems.updated}</p>
                {details.menuItems.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {details.menuItems.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Bulk Upload</h2>
        <p className="mt-1 text-sm text-gray-500">
          Import your menu data from Excel or CSV files
        </p>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <DocumentArrowUpIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Download Template</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Download our Excel template with sample data and instructions to help you prepare your menu data.</p>
            </div>
            <div className="mt-4">
              <Button
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isDownloading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File</h3>
        
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            
            {/* Drag and Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive && !isDragReject
                  ? 'border-primary-400 bg-primary-50'
                  : isDragReject
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              
              <CloudArrowUpIcon className={`mx-auto h-12 w-12 mb-4 ${
                isDragActive && !isDragReject
                  ? 'text-primary-500'
                  : isDragReject
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`} />
              
              <div className="space-y-2">
                {isDragActive && !isDragReject ? (
                  <p className="text-lg font-medium text-primary-600">
                    Drop your file here...
                  </p>
                ) : isDragReject ? (
                  <p className="text-lg font-medium text-red-600">
                    Invalid file type or size
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-900">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                  </>
                )}
                
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Supported formats: Excel (.xlsx, .xls) or CSV files (max 10MB)
            </p>
          </div>

          {/* Update Existing Toggle */}
          <div className="flex items-center">
            <input
              id="update-existing"
              type="checkbox"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="update-existing" className="ml-2 block text-sm text-gray-900">
              Update existing items if they already exist
            </label>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Uploading...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
            
            {uploadResults && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Upload Another File
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Results */}
      {renderUploadResults()}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions</h3>
        <div className="prose prose-sm text-gray-600">
          <ol className="list-decimal list-inside space-y-2">
            <li>Download the Excel template using the button above</li>
            <li>Fill in your menu data in the appropriate sheets (Categories, Tags, Menu Items)</li>
            <li>Save the file and upload it using the form above</li>
            <li>Review the upload results and fix any errors if needed</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Categories and Tags are processed first, then Menu Items</li>
              <li>Menu Items reference Categories and Tags by name (case-insensitive)</li>
              <li>If "Update existing" is checked, existing items will be updated</li>
              <li>If "Update existing" is unchecked, existing items will be skipped</li>
              <li>All prices should be in Indian Rupees (₹)</li>
              <li>Preparation time should be in minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
