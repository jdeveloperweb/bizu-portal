ALTER TABLE student.notes 
ADD COLUMN material_id UUID REFERENCES content.materials(id) ON DELETE CASCADE,
ADD COLUMN highlighted_text TEXT,
ADD COLUMN highlight_color VARCHAR(50) DEFAULT 'yellow';

CREATE INDEX idx_notes_material_id ON student.notes(material_id);
