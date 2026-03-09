-- Adicionar campos de loja e criador original
ALTER TABLE content.flashcard_decks 
ADD COLUMN original_creator_id UUID,
ADD COLUMN is_for_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN price INTEGER DEFAULT 0,
ADD COLUMN rating DOUBLE PRECISION DEFAULT 0,
ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Tabela de compras de decks
CREATE TABLE content.flashcard_deck_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES content.flashcard_decks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    price_paid INTEGER NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_purchase UNIQUE (deck_id, student_id)
);

-- Tabela de avaliações de decks
CREATE TABLE content.flashcard_deck_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES content.flashcard_decks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rating UNIQUE (deck_id, student_id)
);

-- Atualizar decks existentes para marcar o criador atual como original
UPDATE content.flashcard_decks SET original_creator_id = user_id WHERE user_id IS NOT NULL;
