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
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);



  // Generate new QR code (manual generation)
  const generateNewQRCode = useCallback(async () => {
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setGenerating(true);
    
    try {
      const response = await generateQRCode();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setQrData(response.data);
      toast.success('QR code generated successfully!');
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      toast.error('Failed to generate QR code');
      console.error('Generate QR code error:', error);
    } finally {
      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setGenerating(false);
      }
    }
  }, []);

  // Load QR code data
  const loadQRCode = useCallback(async () => {
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    try {
      const response = await getQRCode();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setQrData(response.data);
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (error.response?.status === 404) {
        // QR code doesn't exist yet, this is normal for new restaurants
        setQrData(null);
      } else {
        toast.error('Failed to load QR code');
        console.error('Load QR code error:', error);
      }
    } finally {
      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Delete QR code
  const deleteQRCodeData = useCallback(async () => {
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setDeleting(true);
    try {
      await deleteQRCode();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setQrData(null);
      toast.success('QR code deleted successfully');
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      toast.error('Failed to delete QR code');
      console.error('Delete QR code error:', error);
    } finally {
      // Check if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setDeleting(false);
      }
    }
  }, []);

  // Load QR code on mount
  useEffect(() => {
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
