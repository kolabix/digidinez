import { useState, useEffect, useRef, useCallback } from 'react';
import { generateQRCode, getQRCode, deleteQRCode } from '../services/qrService.js';
import { toast } from '../components/common/Toast.jsx';

export const useQRCode = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    console.log('🔵 Component mounted');
    return () => {
      console.log('🔵 Component unmounting, aborting any pending requests');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);



  // Generate new QR code (manual generation)
  const generateNewQRCode = useCallback(async () => {
    console.log('🟢 generateNewQRCode called');
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    console.log('🟢 Setting generating to true');
    setGenerating(true);
    
    try {
      console.log('🟢 Calling generateQRCode API...');
      const response = await generateQRCode();
      console.log('🟢 generateQRCode API response:', response.data);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🟢 Request was aborted, not updating state');
        return;
      }
      
      console.log('🟢 Setting qrData with generated response');
      setQrData(response.data);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.log('🟢 Error in generateNewQRCode:', error.message);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🟢 Request was aborted, not handling error');
        return;
      }
      
      toast.error('Failed to generate QR code');
      console.error('Generate QR code error:', error);
    } finally {
      console.log('🟢 generateNewQRCode finally block');
      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.log('🟢 Setting generating to false');
        setGenerating(false);
      } else {
        console.log('🟢 Request was aborted, not setting generating to false');
      }
    }
  }, []);

  // Load QR code data
  const loadQRCode = useCallback(async () => {
    console.log('🟡 loadQRCode function called');
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    console.log('🟡 Setting loading to true');
    setLoading(true);
    try {
      console.log('🟡 Calling getQRCode API...');
      const response = await getQRCode();
      console.log('🟡 getQRCode API response:', response.data);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🟡 Request was aborted, not updating state');
        return;
      }
      
      console.log('🟡 Setting qrData with response');
      setQrData(response.data);
    } catch (error) {
      console.log('🟡 Error in loadQRCode:', error.response?.status, error.message);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🟡 Request was aborted, not handling error');
        return;
      }
      
      if (error.response?.status === 404) {
        console.log('🟡 404 error - QR code not found, setting qrData to null');
        // QR code doesn't exist yet, this is normal for new restaurants
        setQrData(null);
      } else {
        console.log('🟡 Other error, showing toast');
        toast.error('Failed to load QR code');
        console.error('Load QR code error:', error);
      }
    } finally {
      console.log('🟡 loadQRCode finally block');
      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.log('🟡 Setting loading to false');
        setLoading(false);
      } else {
        console.log('🟡 Request was aborted, not setting loading to false');
      }
    }
  }, []);

  // Delete QR code
  const deleteQRCodeData = useCallback(async () => {
    console.log('🔴 deleteQRCodeData called');
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    console.log('🔴 Setting deleting to true');
    setDeleting(true);
    try {
      console.log('🔴 Calling deleteQRCode API...');
      await deleteQRCode();
      console.log('🔴 deleteQRCode API completed');
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🔴 Request was aborted, not updating state');
        return;
      }
      
      console.log('🔴 Setting qrData to null and showing success toast');
      setQrData(null);
      toast.success('QR code deleted successfully');
    } catch (error) {
      console.log('🔴 Error in deleteQRCodeData:', error.message);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🔴 Request was aborted, not handling error');
        return;
      }
      
      toast.error('Failed to delete QR code');
      console.error('Delete QR code error:', error);
    } finally {
      console.log('🔴 deleteQRCodeData finally block');
      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.log('🔴 Setting deleting to false');
        setDeleting(false);
      } else {
        console.log('🔴 Request was aborted, not setting deleting to false');
      }
    }
  }, []);

  // Load QR code on mount
  useEffect(() => {
    console.log('🔵 useEffect triggered - loadQRCode called');
    loadQRCode();
  }, [loadQRCode]);

  return {
    qrData,
    loading,
    generating,
    deleting,
    loadQRCode,
    generateNewQRCode,
    deleteQRCodeData
  };
};
