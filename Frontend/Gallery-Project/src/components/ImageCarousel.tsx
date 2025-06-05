import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

interface UploadImageProps {
  token: string;
}

function ImageCarousel({ images }: { images: File[] }) {
  const [current, setCurrent] = useState(0);

  // מעבר תמונות כל 3 שניות
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div style={{ width: 300, height: 300, marginBottom: 20, position: 'relative' }}>
      {images.map((file, i) => (
        <img
          key={i}
          src={URL.createObjectURL(file)}
          alt={`Slide ${i}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}
    </div>
  );
}

export default function UploadImage({ token }: UploadImageProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
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
          const camFile = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFiles(prev => [...prev, camFile]);
          setUseCamera(false);
        });
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select or capture at least one image');
      return;
    }
    setError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', name);
        formData.append('description', description);

        const res = await fetch('http://localhost:5000/api/images', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Upload failed');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Upload or Capture Images</h2>

      <ImageCarousel images={files} />

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

        {!useCamera && (
          <>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFileChange}
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

        <button type="submit" style={{ padding: '8px 16px' }}>
          Upload All
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
