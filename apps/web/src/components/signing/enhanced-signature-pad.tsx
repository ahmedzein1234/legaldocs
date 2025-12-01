'use client';

import * as React from 'react';
import {
  Eraser,
  RotateCcw,
  Check,
  Pen,
  Type,
  Upload,
  Smartphone,
  Monitor,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Palette,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Signature colors
const SIGNATURE_COLORS = [
  { name: 'Blue', value: '#1E3A5F' },
  { name: 'Black', value: '#000000' },
  { name: 'Navy', value: '#0A1929' },
  { name: 'Dark Gray', value: '#333333' },
];

// Font styles for typed signatures
const SIGNATURE_FONTS = [
  { name: 'Script', value: "'Dancing Script', cursive" },
  { name: 'Elegant', value: "'Great Vibes', cursive" },
  { name: 'Classic', value: "'Allura', cursive" },
  { name: 'Modern', value: "'Pacifico', cursive" },
];

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface EnhancedSignaturePadProps {
  onSignatureChange?: (dataUrl: string | null, type: 'draw' | 'type' | 'upload') => void;
  onConfirm?: (dataUrl: string, type: 'draw' | 'type' | 'upload') => void;
  width?: number;
  height?: number;
  className?: string;
  disabled?: boolean;
  translations?: {
    drawTab?: string;
    typeTab?: string;
    uploadTab?: string;
    signHere?: string;
    clear?: string;
    undo?: string;
    redo?: string;
    confirm?: string;
    typeYourName?: string;
    uploadSignature?: string;
    dragDropOrClick?: string;
    supportedFormats?: string;
    strokeWidth?: string;
    color?: string;
    font?: string;
    fullscreen?: string;
  };
}

export function EnhancedSignaturePad({
  onSignatureChange,
  onConfirm,
  width = 500,
  height = 250,
  className,
  disabled = false,
  translations = {},
}: EnhancedSignaturePadProps) {
  const t = {
    drawTab: translations.drawTab || 'Draw',
    typeTab: translations.typeTab || 'Type',
    uploadTab: translations.uploadTab || 'Upload',
    signHere: translations.signHere || 'Sign here with your finger or mouse',
    clear: translations.clear || 'Clear',
    undo: translations.undo || 'Undo',
    redo: translations.redo || 'Redo',
    confirm: translations.confirm || 'Confirm Signature',
    typeYourName: translations.typeYourName || 'Type your full legal name',
    uploadSignature: translations.uploadSignature || 'Upload your signature',
    dragDropOrClick: translations.dragDropOrClick || 'Drag & drop or click to upload',
    supportedFormats: translations.supportedFormats || 'PNG, JPG, or transparent PNG (max 2MB)',
    strokeWidth: translations.strokeWidth || 'Stroke Width',
    color: translations.color || 'Color',
    font: translations.font || 'Font Style',
    fullscreen: translations.fullscreen || 'Fullscreen',
  };

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = React.useState<'draw' | 'type' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = React.useState<Stroke | null>(null);
  const [undoneStrokes, setUndoneStrokes] = React.useState<Stroke[]>([]);
  const [strokeColor, setStrokeColor] = React.useState(SIGNATURE_COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = React.useState(2.5);
  const [typedName, setTypedName] = React.useState('');
  const [selectedFont, setSelectedFont] = React.useState(SIGNATURE_FONTS[0].value);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Canvas operations
  const getCoordinates = React.useCallback((e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: (touch as any).force || 0.5,
      };
    }

    if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        pressure: 0.5,
      };
    }

    return { x: 0, y: 0 };
  }, []);

  const redrawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        const p0 = stroke.points[i - 1];
        const p1 = stroke.points[i];

        // Use quadratic curves for smoother lines
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;

        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }

      ctx.stroke();
    });

    // Draw current stroke
    if (currentStroke && currentStroke.points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);

      for (let i = 1; i < currentStroke.points.length; i++) {
        const p0 = currentStroke.points[i - 1];
        const p1 = currentStroke.points[i];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }

      ctx.stroke();
    }
  }, [strokes, currentStroke]);

  React.useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const startDrawing = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();

    const point = getCoordinates(e);
    setCurrentStroke({
      points: [point],
      color: strokeColor,
      width: strokeWidth,
    });
    setIsDrawing(true);
    setUndoneStrokes([]); // Clear redo history on new stroke
  }, [disabled, getCoordinates, strokeColor, strokeWidth]);

  const draw = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const point = getCoordinates(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  }, [isDrawing, disabled, getCoordinates]);

  const stopDrawing = React.useCallback(() => {
    if (currentStroke && currentStroke.points.length >= 2) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [currentStroke]);

  // Touch event handlers
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDrawing]);

  const clearCanvas = React.useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    setUndoneStrokes([]);
    onSignatureChange?.(null, 'draw');
  }, [onSignatureChange]);

  const undo = React.useCallback(() => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    setUndoneStrokes((prev) => [...prev, lastStroke]);
  }, [strokes]);

  const redo = React.useCallback(() => {
    if (undoneStrokes.length === 0) return;
    const lastUndone = undoneStrokes[undoneStrokes.length - 1];
    setUndoneStrokes((prev) => prev.slice(0, -1));
    setStrokes((prev) => [...prev, lastUndone]);
  }, [undoneStrokes]);

  const getCanvasDataUrl = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, []);

  // Generate typed signature as image
  const generateTypedSignature = React.useCallback(() => {
    if (!typedName.trim()) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear background (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font
    const fontSize = Math.min(60, canvas.width / (typedName.length * 0.6));
    ctx.font = `${fontSize}px ${selectedFont}`;
    ctx.fillStyle = strokeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  }, [typedName, selectedFont, strokeColor, width, height]);

  // Handle file upload
  const handleFileUpload = React.useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      onSignatureChange?.(result, 'upload');
    };
    reader.readAsDataURL(file);
  }, [onSignatureChange]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Confirm signature
  const handleConfirm = React.useCallback(() => {
    let dataUrl: string | null = null;

    switch (activeTab) {
      case 'draw':
        dataUrl = getCanvasDataUrl();
        break;
      case 'type':
        dataUrl = generateTypedSignature();
        break;
      case 'upload':
        dataUrl = uploadedImage;
        break;
    }

    if (dataUrl) {
      onConfirm?.(dataUrl, activeTab);
    }
  }, [activeTab, getCanvasDataUrl, generateTypedSignature, uploadedImage, onConfirm]);

  // Check if signature is valid
  const hasValidSignature = React.useMemo(() => {
    switch (activeTab) {
      case 'draw':
        return strokes.length > 0;
      case 'type':
        return typedName.trim().length >= 2;
      case 'upload':
        return uploadedImage !== null;
      default:
        return false;
    }
  }, [activeTab, strokes.length, typedName, uploadedImage]);

  // Fullscreen toggle
  const toggleFullscreen = React.useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-background rounded-lg border p-4',
        isFullscreen && 'fixed inset-0 z-50 m-0 rounded-none',
        className
      )}
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-3 w-auto">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pen className="h-4 w-4" />
              <span className="hidden sm:inline">{t.drawTab}</span>
            </TabsTrigger>
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">{t.typeTab}</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t.uploadTab}</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="hidden sm:flex"
            title={t.fullscreen}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Draw Tab */}
        <TabsContent value="draw" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
            {/* Color picker */}
            <div className="flex items-center gap-1">
              <Palette className="h-4 w-4 text-muted-foreground" />
              {SIGNATURE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setStrokeColor(color.value)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-transform',
                    strokeColor === color.value
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Stroke width */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <span className="text-xs text-muted-foreground">{t.strokeWidth}</span>
              <Slider
                value={[strokeWidth]}
                onValueChange={([v]: number[]) => setStrokeWidth(v)}
                min={1}
                max={5}
                step={0.5}
                className="w-20"
              />
            </div>

            <div className="flex-1" />

            {/* Undo/Redo/Clear */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={strokes.length === 0 || disabled}
                title={t.undo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={undoneStrokes.length === 0 || disabled}
                title={t.redo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearCanvas}
                disabled={strokes.length === 0 || disabled}
                title={t.clear}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className={cn(
                'w-full border-2 border-dashed rounded-lg bg-white cursor-crosshair touch-none',
                disabled && 'opacity-50 cursor-not-allowed',
                isFullscreen && 'h-[60vh]'
              )}
              style={{ maxHeight: isFullscreen ? '60vh' : height }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {strokes.length === 0 && !currentStroke && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground">
                  <Pen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t.signHere}</p>
                  <p className="text-xs mt-1 flex items-center justify-center gap-2">
                    <Smartphone className="h-3 w-3" />
                    <span>Touch</span>
                    <span>•</span>
                    <Monitor className="h-3 w-3" />
                    <span>Mouse</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Type Tab */}
        <TabsContent value="type" className="space-y-4">
          {/* Font selector */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">{t.font}:</span>
            {SIGNATURE_FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => setSelectedFont(font.value)}
                className={cn(
                  'px-3 py-1 rounded text-lg border transition-colors',
                  selectedFont === font.value
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:bg-muted'
                )}
                style={{ fontFamily: font.value }}
              >
                Aa
              </button>
            ))}

            <div className="h-6 w-px bg-border mx-2" />

            {/* Color picker */}
            <div className="flex items-center gap-1">
              {SIGNATURE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setStrokeColor(color.value)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-transform',
                    strokeColor === color.value
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="typed-name">{t.typeYourName}</Label>
            <Input
              id="typed-name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Smith"
              disabled={disabled}
              className="text-lg"
            />
          </div>

          {/* Preview */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 bg-white min-h-[150px] flex items-center justify-center',
              !typedName && 'text-muted-foreground'
            )}
          >
            {typedName ? (
              <span
                className="text-4xl sm:text-5xl"
                style={{ fontFamily: selectedFont, color: strokeColor }}
              >
                {typedName}
              </span>
            ) : (
              <span className="text-sm">Your signature will appear here</span>
            )}
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {uploadedImage ? (
            <div className="space-y-4">
              <div className="border-2 rounded-lg p-4 bg-white">
                <img
                  src={uploadedImage}
                  alt="Uploaded signature"
                  className="max-w-full max-h-[200px] mx-auto object-contain"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedImage(null);
                  onSignatureChange?.(null, 'upload');
                }}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 me-2" />
                Upload Different Image
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">{t.uploadSignature}</p>
              <p className="text-sm text-muted-foreground mb-4">{t.dragDropOrClick}</p>
              <p className="text-xs text-muted-foreground">{t.supportedFormats}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Button */}
      <div className="mt-4 pt-4 border-t">
        <Button
          onClick={handleConfirm}
          disabled={!hasValidSignature || disabled}
          className="w-full"
          size="lg"
        >
          <Check className="h-5 w-5 me-2" />
          {t.confirm}
        </Button>
      </div>
    </div>
  );
}

// Signature Display Component
export function SignaturePreview({
  signature,
  type,
  className,
  showBadge = true,
}: {
  signature: string;
  type: 'draw' | 'type' | 'upload';
  className?: string;
  showBadge?: boolean;
}) {
  const typeLabels = {
    draw: 'Hand-drawn',
    type: 'Typed',
    upload: 'Uploaded',
  };

  return (
    <div className={cn('relative border rounded-lg p-4 bg-white', className)}>
      {showBadge && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-muted px-2 py-1 rounded">
            {typeLabels[type]}
          </span>
        </div>
      )}
      <img
        src={signature}
        alt="Signature"
        className="max-w-full h-auto max-h-[120px] mx-auto object-contain"
      />
    </div>
  );
}
