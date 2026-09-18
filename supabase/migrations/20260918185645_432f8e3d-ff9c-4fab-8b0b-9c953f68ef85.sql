CREATE POLICY "Visitantes podem enviar referencias"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'referencias');

CREATE POLICY "Equipe autenticada pode ver referencias"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'referencias');