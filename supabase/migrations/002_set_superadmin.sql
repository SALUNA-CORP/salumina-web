-- ============================================================================
-- MIGRACIÓN: Configurar superadmin inicial
-- Fecha: 2026-06-04
-- Descripción: Configura salunacorpsas@gmail.com como superadmin
-- ============================================================================

-- 1. BUSCAR O CREAR USUARIO SUPERADMIN
-- ============================================================================

DO $$
DECLARE
  admin_id UUID;
  admin_email TEXT := 'salunacorpsas@gmail.com';
BEGIN
  -- Buscar si el usuario ya existe
  SELECT id INTO admin_id
  FROM user_profiles
  WHERE email = admin_email;

  IF admin_id IS NULL THEN
    -- Usuario no existe, crear uno nuevo
    RAISE NOTICE '⚠️  Usuario % no encontrado en user_profiles', admin_email;
    RAISE NOTICE '📝 Debes crear este usuario primero en auth.users o desde la app';
    RAISE NOTICE '   Después ejecuta nuevamente esta migración';
  ELSE
    -- Usuario existe, hacerlo superadmin
    UPDATE user_profiles
    SET
      role = 'superadmin',
      status = 'approved',
      approved_at = NOW(),
      full_name = COALESCE(full_name, 'Administrador Salumina')
    WHERE id = admin_id;

    RAISE NOTICE '✅ Usuario % configurado como superadmin', admin_email;
    RAISE NOTICE '   ID: %', admin_id;
  END IF;
END $$;

-- 2. VERIFICAR REFERRAL_CODES ÚNICOS
-- ============================================================================

-- Listar todos los usuarios con sus roles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '👥 USUARIOS REGISTRADOS:';
  RAISE NOTICE '========================';

  FOR user_record IN
    SELECT
      email,
      role,
      status,
      referral_code,
      created_at
    FROM user_profiles
    ORDER BY created_at
  LOOP
    RAISE NOTICE '  % | % | % | Ref: %',
      RPAD(user_record.email, 35),
      RPAD(COALESCE(user_record.role, 'user'), 12),
      RPAD(COALESCE(user_record.status, 'pending'), 10),
      user_record.referral_code;
  END LOOP;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📋 SIGUIENTES PASOS:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Si salunacorpsas@gmail.com no existe todavía:';
  RAISE NOTICE '   - Regístrate en /register con cualquier código de referido';
  RAISE NOTICE '   - Luego ejecuta esta migración nuevamente';
  RAISE NOTICE '';
  RAISE NOTICE '2. Los usuarios existentes mantienen sus datos:';
  RAISE NOTICE '   - Planes activos (desktop_plan)';
  RAISE NOTICE '   - Configuraciones de Telegram';
  RAISE NOTICE '   - Todo su historial';
  RAISE NOTICE '';
  RAISE NOTICE '3. Ahora pueden referir usuarios nuevos usando su referral_code';
  RAISE NOTICE '';
  RAISE NOTICE '4. Para crear el primer referido del superadmin:';
  RAISE NOTICE '   https://tu-dominio.com/register?ref=[REFERRAL_CODE_DEL_ADMIN]';
  RAISE NOTICE '';
END $$;
