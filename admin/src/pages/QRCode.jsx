import { useQRCode } from '../hooks/useQRCode.js';
import { Button } from '../components/common/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { toast } from '../components/common/Toast.jsx';
import { useState } from 'react';

export const QRCode = () => {
  const { 
    qrData, 
    loading, 
    generating, 
    deleting, 
    generateNewQRCode, 
    deleteQRCodeData 
  } = useQRCode();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleGenerateQR = () => {
    generateNewQRCode();
  };

  const handleDeleteQR = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteQRCodeData();
    setShowDeleteConfirm(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy URL');
    }
  };


  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Management</h1>
        <p className="text-gray-600">
          Generate and manage QR codes for your restaurant's digital menu
        </p>
      </div>

      {!qrData ? (
        // No QR code exists
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No QR Code Generated
            </h3>
            <p className="text-gray-600 mb-6">
              Generate a QR code to allow customers to access your digital menu
            </p>
          </div>
          
          <Button
            onClick={handleGenerateQR}
            disabled={generating}
            className="w-full sm:w-auto"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                Generating QR Code...
              </>
            ) : (
              'Generate QR Code'
            )}
          </Button>
        </div>
      ) : (
        // QR code exists
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* QR Code Image */}
              <div className="flex-shrink-0">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <img
                    src={`${qrData.qrCode.publicUrl}`}
                    alt="Restaurant QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* QR Code Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your QR Code
                  </h3>
                  <p className="text-gray-600">
                    Customers can scan this QR code to access your digital menu
                  </p>
                </div>

                {/* QR Code Info */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generated On
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(qrData.qrCode.generatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Size
                    </label>
                    <p className="text-sm text-gray-900">
                      {(qrData.qrCode.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Public URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${qrData.qrCode.publicUrl}`}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                      />
                      <Button
                        onClick={() => copyToClipboard(`${qrData.qrCode.publicUrl}`)}
                        variant="outline"
                        size="sm"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleGenerateQR}
                    disabled={generating}
                    variant="outline"
                  >
                    {generating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Regenerating...
                      </>
                    ) : (
                      'Regenerate QR Code'
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleDeleteQR}
                    disabled={deleting}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Deleting...
                      </>
                    ) : (
                      'Delete QR Code'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">
              How to Use Your QR Code
            </h4>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <p>Print this QR code and place it on your restaurant tables or entrance</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <p>Customers can scan the QR code with their phone camera</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <p>They'll be taken directly to your digital menu</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete QR Code"
        message="Are you sure you want to delete your QR code? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};
