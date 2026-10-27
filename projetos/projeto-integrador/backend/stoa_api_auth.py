"""Autenticação das APIs de atividades da STOA.
Confirma JWT na API de autenticação do Supabase e consulta perfil via REST/RLS.
Nenhuma chave service_role é utilizada no servidor de atividades.
"""
import asyncio
import json
import os
from urllib import request, error
from fastapi import HTTPException, Request

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://zlixkjuwhiijikrhofdh.supabase.co').rstrip('/')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaXhranV3aGlpamlrcmhvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDMzODAsImV4cCI6MjEwNTY3OTM4MH0.vsBv-NBnjq3SWwP7EJqgqmQa38_Nf3j5fMkzwFpEEOo')

def _consultar(url: str, token: str):
    req=request.Request(url,headers={
        'Authorization':'Bearer '+token,
        'apikey':SUPABASE_ANON_KEY,
        'Accept':'application/json',
    })
    try:
        with request.urlopen(req,timeout=8) as resp:
            return json.loads(resp.read(65536).decode('utf-8'))
    except (error.HTTPError,error.URLError,TimeoutError,ValueError) as exc:
        raise HTTPException(status_code=401,detail='Sessão inválida ou indisponível') from exc

async def exigir_aprendiz(req: Request):
    auth=req.headers.get('authorization','')
    if not auth.startswith('Bearer ') or len(auth)<30:
        raise HTTPException(status_code=401,detail='Faça login para utilizar esta API')
    token=auth[7:].strip()
    user=await asyncio.to_thread(_consultar,SUPABASE_URL+'/auth/v1/user',token)
    user_id=user.get('id') if isinstance(user,dict) else None
    if not user_id:
        raise HTTPException(status_code=401,detail='Sessão inválida')
    from urllib.parse import quote
    profiles=await asyncio.to_thread(_consultar,SUPABASE_URL+'/rest/v1/perfis?select=id,tipo&id=eq.'+quote(str(user_id),safe=''),token)
    if not isinstance(profiles,list) or len(profiles)!=1 or profiles[0].get('tipo')!='aprendiz':
        raise HTTPException(status_code=403,detail='Somente aprendizes autorizados podem usar esta atividade')
    return user_id
