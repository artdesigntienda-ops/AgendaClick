CREATE TABLE public.otp_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS (aunque accederemos mediante el service_role key en el backend, es buena práctica)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
