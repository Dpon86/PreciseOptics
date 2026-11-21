/**
 * ImageUploadField
 * Reusable image upload input with preview, validation, and a lightweight viewer.
 *
 * Props:
 *   label        (string)   — field label
 *   name         (string)   — form field name
 *   value        (File|null)— controlled file value
 *   existingUrl  (string)   — URL of an already-saved image (read-only preview)
 *   onChange     (fn)       — called with (name, File|null)
 *   disabled     (bool)
 *
 * Usage:
 *   <ImageUploadField
 *     label="Right Eye Image"
 *     name="right_eye_image"
 *     value={files.right_eye_image}
 *     onChange={(name, file) => setFiles(f => ({ ...f, [name]: file }))}
 *   />
 */

import React, { useState, useRef } from 'react';
import './ImageUploadField.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ImageUploadField = ({ label, name, value, existingUrl, onChange, disabled }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { return; }

    // Client-side validation (mirrors backend validators)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError(`Unsupported file type "${file.type}". Allowed: JPEG, PNG, TIFF, BMP, GIF, WebP.`);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }

    setValidationError('');
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(name, file);
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError('');
    if (inputRef.current) inputRef.current.value = '';
    onChange(name, null);
  };

  const openViewer = (src) => {
    setViewerSrc(src);
    setViewerOpen(true);
  };

  const displaySrc = preview || existingUrl;

  return (
    <div className="iuf-field">
      <label className="iuf-label">{label}</label>

      {displaySrc ? (
        <div className="iuf-preview-wrap">
          <img
            src={displaySrc}
            alt={label}
            className="iuf-thumbnail"
            onClick={() => openViewer(displaySrc)}
            title="Click to enlarge"
          />
          <div className="iuf-preview-actions">
            <button type="button" className="iuf-btn iuf-btn--view" onClick={() => openViewer(displaySrc)}>
              View
            </button>
            {!disabled && (
              <>
                <button type="button" className="iuf-btn iuf-btn--change" onClick={() => inputRef.current?.click()}>
                  Change
                </button>
                <button type="button" className="iuf-btn iuf-btn--remove" onClick={handleRemove}>
                  Remove
                </button>
              </>
            )}
          </div>
          <p className="iuf-file-name">{value?.name || (existingUrl ? 'Existing image' : '')}</p>
        </div>
      ) : (
        <div
          className={`iuf-dropzone${disabled ? ' iuf-dropzone--disabled' : ''}`}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!disabled && e.dataTransfer.files[0]) {
              const synth = { target: { files: e.dataTransfer.files } };
              handleFileChange(synth);
            }
          }}
        >
          <span className="iuf-dropzone-icon">🖼️</span>
          <p className="iuf-dropzone-text">
            {disabled ? 'No image uploaded' : 'Click or drag an image here'}
          </p>
          {!disabled && (
            <p className="iuf-dropzone-hint">JPEG, PNG, TIFF — max {MAX_SIZE_MB} MB</p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/tiff,image/bmp,image/gif,image/webp"
        className="iuf-hidden-input"
        disabled={disabled}
        onChange={handleFileChange}
      />

      {validationError && (
        <p className="iuf-error" role="alert">{validationError}</p>
      )}

      {/* Lightbox viewer */}
      {viewerOpen && (
        <div className="iuf-lightbox" onClick={() => setViewerOpen(false)} role="dialog" aria-label="Image viewer">
          <div className="iuf-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="iuf-lightbox-close" onClick={() => setViewerOpen(false)}>✕</button>
            <img src={viewerSrc} alt="Full size view" className="iuf-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
