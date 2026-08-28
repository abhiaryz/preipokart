import { AuthSplit } from '../components/AuthSplit';
import { OtpAuthForm } from '../components/OtpAuthForm';

export default function Login() {
  return (
    <AuthSplit>
      <OtpAuthForm mode="login" />
    </AuthSplit>
  );
}
