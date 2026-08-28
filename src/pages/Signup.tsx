import { AuthSplit } from '../components/AuthSplit';
import { OtpAuthForm } from '../components/OtpAuthForm';

export default function Signup() {
  return (
    <AuthSplit>
      <OtpAuthForm mode="signup" />
    </AuthSplit>
  );
}
