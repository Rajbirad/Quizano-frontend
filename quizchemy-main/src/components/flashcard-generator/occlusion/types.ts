
export interface OcclusionRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface ImageOcclusionProps {
  imageUrl: string;
  onSaveOcclusions: (rects: OcclusionRect[], imageUrl: string) => void;
}
