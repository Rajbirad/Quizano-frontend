import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Slide, StepItem, ComparisonItem } from "./SlideCard";

interface SlideEditorProps {
  slide: Slide;
  onSave: (slide: Slide) => void;
  onClose: () => void;
}

export function SlideEditor({ slide, onSave, onClose }: SlideEditorProps) {
  const [editedSlide, setEditedSlide] = useState<Slide>(slide);

  useEffect(() => {
    setEditedSlide(slide);
  }, [slide]);

  const handleTypeChange = (type: "title" | "content" | "bullets" | "steps" | "comparison") => {
    setEditedSlide(prev => ({
      ...prev,
      type,
      bullets: type === "bullets" ? (prev.bullets || ["New bullet point"]) : undefined,
      content: type === "content" ? (prev.content || "") : undefined,
      subtitle: type === "title" ? (prev.subtitle || "") : undefined,
      steps: type === "steps" ? (prev.steps || [{ label: "Step 1", description: "Description" }]) : undefined,
      comparison: type === "comparison" ? (prev.comparison || { leftTitle: "Option A", rightTitle: "Option B", items: [{ label: "Feature", left: "Value A", right: "Value B" }] }) : undefined,
    }));
  };

  const addStep = () => {
    setEditedSlide(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { label: "New Step", description: "Description" }]
    }));
  };

  const removeStep = (index: number) => {
    setEditedSlide(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: keyof StepItem, value: string) => {
    setEditedSlide(prev => ({
      ...prev,
      steps: prev.steps?.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const addComparisonItem = () => {
    setEditedSlide(prev => ({
      ...prev,
      comparison: prev.comparison ? {
        ...prev.comparison,
        items: [...prev.comparison.items, { label: "New Item", left: "Left value", right: "Right value" }]
      } : undefined
    }));
  };

  const removeComparisonItem = (index: number) => {
    setEditedSlide(prev => ({
      ...prev,
      comparison: prev.comparison ? {
        ...prev.comparison,
        items: prev.comparison.items.filter((_, i) => i !== index)
      } : undefined
    }));
  };

  const updateComparisonItem = (index: number, field: keyof ComparisonItem, value: string) => {
    setEditedSlide(prev => ({
      ...prev,
      comparison: prev.comparison ? {
        ...prev.comparison,
        items: prev.comparison.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
      } : undefined
    }));
  };

  const updateComparisonTitle = (side: "leftTitle" | "rightTitle", value: string) => {
    setEditedSlide(prev => ({
      ...prev,
      comparison: prev.comparison ? { ...prev.comparison, [side]: value } : undefined
    }));
  };

  const addBullet = () => {
    setEditedSlide(prev => ({
      ...prev,
      bullets: [...(prev.bullets || []), "New bullet point"]
    }));
  };

  const removeBullet = (index: number) => {
    setEditedSlide(prev => ({
      ...prev,
      bullets: prev.bullets?.filter((_, i) => i !== index)
    }));
  };

  const updateBullet = (index: number, value: string) => {
    setEditedSlide(prev => ({
      ...prev,
      bullets: prev.bullets?.map((b, i) => i === index ? value : b)
    }));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-xl z-50 flex flex-col" data-testid="slide-editor-panel">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
        <h3 className="font-semibold">Edit Slide</h3>
        <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-editor">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label>Slide Type</Label>
          <Select value={editedSlide.type} onValueChange={handleTypeChange}>
            <SelectTrigger data-testid="select-slide-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title Slide</SelectItem>
              <SelectItem value="content">Content Slide</SelectItem>
              <SelectItem value="bullets">Bullet Points</SelectItem>
              <SelectItem value="steps">Steps</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={editedSlide.title}
            onChange={(e) => setEditedSlide(prev => ({ ...prev, title: e.target.value }))}
            data-testid="input-slide-title"
          />
        </div>

        {editedSlide.type === "title" && (
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={editedSlide.subtitle || ""}
              onChange={(e) => setEditedSlide(prev => ({ ...prev, subtitle: e.target.value }))}
              data-testid="input-slide-subtitle"
            />
          </div>
        )}

        {editedSlide.type === "content" && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={editedSlide.content || ""}
              onChange={(e) => setEditedSlide(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              data-testid="textarea-slide-content"
            />
          </div>
        )}

        {editedSlide.type === "bullets" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Bullet Points</Label>
              <Button size="sm" variant="ghost" onClick={addBullet} data-testid="button-add-bullet">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {editedSlide.bullets?.map((bullet, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    data-testid={`input-bullet-${i}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeBullet(i)}
                    disabled={editedSlide.bullets?.length === 1}
                    data-testid={`button-remove-bullet-${i}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {editedSlide.type === "steps" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Steps</Label>
              <Button size="sm" variant="ghost" onClick={addStep} data-testid="button-add-step">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {editedSlide.steps?.map((step, i) => (
                <div key={i} className="space-y-2 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Step {i + 1}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeStep(i)}
                      disabled={editedSlide.steps?.length === 1}
                      data-testid={`button-remove-step-${i}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Step label"
                    value={step.label}
                    onChange={(e) => updateStep(i, "label", e.target.value)}
                    data-testid={`input-step-label-${i}`}
                  />
                  <Textarea
                    placeholder="Step description"
                    value={step.description}
                    onChange={(e) => updateStep(i, "description", e.target.value)}
                    rows={2}
                    data-testid={`textarea-step-desc-${i}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {editedSlide.type === "comparison" && editedSlide.comparison && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Left Column Title</Label>
                <Input
                  value={editedSlide.comparison.leftTitle}
                  onChange={(e) => updateComparisonTitle("leftTitle", e.target.value)}
                  data-testid="input-comparison-left-title"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Right Column Title</Label>
                <Input
                  value={editedSlide.comparison.rightTitle}
                  onChange={(e) => updateComparisonTitle("rightTitle", e.target.value)}
                  data-testid="input-comparison-right-title"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Comparison Items</Label>
                <Button size="sm" variant="ghost" onClick={addComparisonItem} data-testid="button-add-comparison">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {editedSlide.comparison.items.map((item, i) => (
                  <div key={i} className="space-y-2 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        placeholder="Item label"
                        value={item.label}
                        onChange={(e) => updateComparisonItem(i, "label", e.target.value)}
                        className="flex-1"
                        data-testid={`input-comparison-label-${i}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeComparisonItem(i)}
                        disabled={editedSlide.comparison?.items.length === 1}
                        data-testid={`button-remove-comparison-${i}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Left value"
                        value={item.left}
                        onChange={(e) => updateComparisonItem(i, "left", e.target.value)}
                        data-testid={`input-comparison-left-${i}`}
                      />
                      <Input
                        placeholder="Right value"
                        value={item.right}
                        onChange={(e) => updateComparisonItem(i, "right", e.target.value)}
                        data-testid={`input-comparison-right-${i}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-edit">
          Cancel
        </Button>
        <Button onClick={() => onSave(editedSlide)} className="flex-1" data-testid="button-save-slide">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
