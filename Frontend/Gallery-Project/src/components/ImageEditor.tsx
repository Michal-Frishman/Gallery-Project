import  { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface ImageEditorProps {
  imageUrl: string;
  onCancel: () => void;
}

export default function ImageEditor({ imageUrl, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [_, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 1000 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', gap: 10 }}>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={e => setZoom(+e.target.value)}
          />
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={e => setRotation(+e.target.value)}
          />
          <button onClick={onCancel} style={{ padding: '8px 16px' }}>ביטול</button>
          {/* ניתן להוסיף כפתור "שמור" שיחתוך וישלח את התמונה */}
        </div>
      </div>
    </div>
  );
}
