import { useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

interface UploadImageProps {
  token: string;
}

export default function UploadImage({ token }: UploadImageProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  const capture = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      fetch(screenshot)
        .then(res => res.blob())
        .then(blob => {
          const camFile = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
          setFile(camFile);
          setUseCamera(false);
        });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or capture an image');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('description', description);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Upload failed');
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Upload or Capture Image</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Image Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        {!file && !useCamera && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              style={{ marginBottom: 10 }}
            />
            <button type="button" onClick={() => setUseCamera(true)} style={{ marginBottom: 10 }}>
              📷 Use Camera
            </button>
          </>
        )}

        {useCamera && (
          <div style={{ marginBottom: 10 }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={300}
              videoConstraints={{ facingMode: 'user' }}
            />
            <button type="button" onClick={capture} style={{ marginTop: 10 }}>
              📸 Capture
            </button>
          </div>
        )}

        {file && (
          <div style={{ marginBottom: 10 }}>
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: 300, display: 'block', marginBottom: 10 }}
            />
            <button
              type="button"
              onClick={() => setFile(null)}
              style={{ padding: '6px 12px' }}
            >
              ❌ Change Image
            </button>
          </div>
        )}

        <button type="submit" style={{ padding: '8px 16px' }}>
          Upload
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
