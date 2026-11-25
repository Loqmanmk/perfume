import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Field, FormAlert, inputClass } from '@/components/ui/form/Field';
import {
  loginSchema,
  MIN_PASSWORD_LENGTH,
  registerSchema,
  type LoginInput,
  type PublicUser,
  type RegisterInput,
} from '@/domain/user';
import { applyServerErrors } from '@/lib/forms';
import { useLogin, useRegister } from './useSession';

interface AuthFormProps {
  onSuccess: (user: PublicUser) => void;
}

export function LoginForm({ onSuccess }: AuthFormProps) {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      onSuccess(await login.mutateAsync(values));
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormAlert message={errors.root?.message} />
      <Field id="login-email" label="Email" error={errors.email?.message}>
        {(control) => (
          <input {...control} {...register('email')} type="email" autoComplete="email" className={inputClass(!!errors.email, 'min-h-12')} />
        )}
      </Field>
      <Field id="login-password" label="Password" error={errors.password?.message}>
        {(control) => (
          <input
            {...control}
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className={inputClass(!!errors.password, 'min-h-12')}
          />
        )}
      </Field>
      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

export function RegisterForm({ onSuccess }: AuthFormProps) {
  const registerAccount = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      onSuccess(await registerAccount.mutateAsync(values));
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormAlert message={errors.root?.message} />
      <Field id="register-name" label="Full name" error={errors.name?.message}>
        {(control) => (
          <input {...control} {...register('name')} autoComplete="name" className={inputClass(!!errors.name, 'min-h-12')} />
        )}
      </Field>
      <Field id="register-email" label="Email" error={errors.email?.message}>
        {(control) => (
          <input {...control} {...register('email')} type="email" autoComplete="email" className={inputClass(!!errors.email, 'min-h-12')} />
        )}
      </Field>
      <Field
        id="register-password"
        label="Password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={errors.password?.message}
      >
        {(control) => (
          <input
            {...control}
            {...register('password')}
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.password, 'min-h-12')}
          />
        )}
      </Field>
      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Creating your account…' : 'Create account'}
      </Button>
    </form>
  );
}
