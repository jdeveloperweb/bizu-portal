DO $$
DECLARE
    v_course_id UUID;
    v_module_id UUID;
    i INT;
BEGIN
    -- 1. Tenta encontrar o curso selecionado ou o primeiro curso disponível
    SELECT id INTO v_course_id FROM content.courses LIMIT 1;
    
    IF v_course_id IS NULL THEN
        INSERT INTO content.courses (id, title, description, status, created_at, updated_at, has_essay, is_mandatory)
        VALUES (gen_random_uuid(), 'Curso Arena PVP', 'Curso criado para testes', 'PUBLISHED', now(), now(), false, false)
        RETURNING id INTO v_course_id;
    END IF;

    -- 2. Garante que o curso tenha pelo menos um módulo
    SELECT id INTO v_module_id FROM content.modules WHERE course_id = v_course_id LIMIT 1;
    IF v_module_id IS NULL THEN
        INSERT INTO content.modules (id, title, description, order_index, course_id)
        VALUES (gen_random_uuid(), 'Módulo de Questões', 'Módulo gerado via SQL', 1, v_course_id)
        RETURNING id INTO v_module_id;
    END IF;

    -- 3. Insere 150 questões de teste variadas na categoria QUIZ
    FOR i IN 1..150 LOOP
        INSERT INTO content.questions (
            id, statement, options, correct_option, difficulty, subject, 
            category, question_type, module_id, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            '<p>Questão de Treino Quick Quiz #' || i || '. (SQL SEED) Verifique se esta questão aparece na aba de Treino.</p>',
            '{"0": "Resposta Correta A", "1": "Resposta B", "2": "Resposta C", "3": "Resposta D"}'::jsonb,
            'A',
            (ARRAY['EASY', 'MEDIUM', 'HARD'])[floor(random() * 3 + 1)], -- Dificuldade aleatória
            (ARRAY['Direito Constitucional', 'Direito Administrativo', 'Português', 'Matemática', 'Informática'])[floor(random() * 5 + 1)], -- Matérias aleatórias
            'QUIZ', -- CATEGORIA CORRIGIDA PARA QUIZ
            'MULTIPLE_CHOICE',
            v_module_id,
            now(),
            now()
        );
    END LOOP;
    
    RAISE NOTICE 'Sucesso! 150 questões de QUIZ inseridas.';
END $$;
