-- Corrigir tipo da coluna rating para compatibilidade com Hibernate Double
ALTER TABLE content.flashcard_decks 
ALTER COLUMN rating TYPE DOUBLE PRECISION;
