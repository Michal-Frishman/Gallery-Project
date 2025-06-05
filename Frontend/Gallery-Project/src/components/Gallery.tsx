import { useEffect, useState } from 'react';

interface Image {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface GalleryProps {
  token: string;
}
import ImageEditor from './ImageEditor';
import { Link } from 'react-router-dom';

export default function Gallery({ token }: GalleryProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);

  const [editImage, setEditImage] = useState<string | null>(null);

  const fetchImages = async () => {
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/images', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch images');
      const data: Image[] = await res.json();
      setImages(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/images/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete image');
      setImages(images.filter(img => img._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <h2>Your Images</h2>

      <div style={{ marginBottom: 20 }}>
        <Link to="/upload">
          <button>Upload New Image</button>
        </Link>
        <button onClick={() => setShowSlideshow(true)} style={{ marginLeft: 10 }}>
          ▶️ הפעל מצגת
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {images.length === 0 && <p>No images found.</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {images.map(image => (
          <div key={image._id} style={{ border: '1px solid #ccc', padding: 10, width: 200 }}>
            <img
              src={image.imageUrl}
              alt={image.name}
              style={{ width: '100%', height: 150, objectFit: 'cover' }}
            />
            <h4>{image.name}</h4>
            <p>{image.description}</p>
            <button onClick={() => setEditImage(image.imageUrl)}>ערוך</button>
            <button onClick={() => handleDelete(image._id)} style={{ color: 'red' }}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {showSlideshow && images.length > 0 && (
        <Slideshow images={images} onClose={() => setShowSlideshow(false)} />
      )}
      {editImage && (
        <ImageEditor
          imageUrl={editImage}
          onCancel={() => setEditImage(null)}
        />
      )}

    </div>

  );
}
function Slideshow({
  images,
  onClose,
}: {
  images: Image[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % images.length);
        setFade(true);
      }, 300); // זמן ביניים קצר לפני החלפה
    }, 1500); // זמן בין תמונות

    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        flexDirection: 'column',
        color: '#fff',
        padding: 20,
        userSelect: 'none',
        textAlign: 'center'
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={images[index].imageUrl}
          alt={images[index].name}
          style={{
            maxWidth: '90vw',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: 10,
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            boxShadow: '0 0 20px rgba(0,0,0,0.7)'
          }}
        />
        <button
          onClick={() => setIndex(i => (i - 1 + images.length) % images.length)}
          style={{
            position: 'absolute',
            top: '50%',
            left: -40,
            fontSize: 30,
            background: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transform: 'translateY(-50%)',
          }}
        >
          ←
        </button>
        <button
          onClick={() => setIndex(i => (i + 1) % images.length)}
          style={{
            position: 'absolute',
            top: '50%',
            right: -40,
            fontSize: 30,
            background: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transform: 'translateY(-50%)',
          }}
        >
          →
        </button>
      </div>
      <h3 style={{ marginTop: 10 }}>{images[index].name}</h3>
      <p>{images[index].description}</p>
      <button
        onClick={onClose}
        style={{
          marginTop: 20,
          padding: '8px 16px',
          fontSize: 16,
          background: '#fff',
          color: '#000',
          borderRadius: 4,
          border: 'none',
          cursor: 'pointer'
        }}
      >
        ❌ סגור מצגת
      </button>
    </div>
  );
}
