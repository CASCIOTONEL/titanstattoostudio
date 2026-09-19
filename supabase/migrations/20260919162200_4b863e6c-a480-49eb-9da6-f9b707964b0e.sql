drop policy if exists "Qualquer visitante pode enviar um orcamento" on public.leads;
create policy "Visitante envia um orcamento valido" on public.leads
  for insert to anon, authenticated
  with check (
    char_length(nome) between 2 and 120
    and char_length(whatsapp) between 8 and 30
    and char_length(endereco) between 3 and 200
    and char_length(servico) between 2 and 60
    and char_length(ideia) between 3 and 2000
    and char_length(local_corpo) between 2 and 80
    and largura_cm > 0 and largura_cm <= 300
    and altura_cm > 0 and altura_cm <= 300
    and coalesce(array_length(referencias, 1), 0) <= 5
    and status = 'novo'
    and observacoes is null
  );

drop policy if exists "Qualquer visitante pode enviar referencias" on storage.objects;
drop policy if exists "Visitante envia referencias" on storage.objects;
create policy "Visitante envia imagem de referencia" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'referencias'
    and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','heic','heif')
    and char_length(name) < 200
  );