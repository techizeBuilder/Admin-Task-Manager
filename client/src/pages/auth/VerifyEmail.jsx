import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [errors, setErrors] = useState({});
  const [userName, setUserName] = useState('');
    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "Verification token is missing from the URL",
        variant: "destructive"
      });
      setLocation('/login');
      return;
    }
    setVerificationToken(token);
    if (name) setUserName(name);
  }, [setLocation, toast]);
  const passwordCriteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
  };
    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid) {
      newErrors.password = "Password does not meet all requirements";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationToken,
          password: password
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Store auth token and redirect to dashboard
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        toast({
          title: "Email Verified Successfully!",
          description: "Your account is now active. Welcome to TaskSetu!",
          variant: "default"
        });

        // Redirect to dashboard
        setLocation('/');
      } else {
        setErrors({ submit: result.message || "Verification failed" });
        toast({
          title: "Verification Failed",
          description: result.message || "Please try again or contact support",
          variant: "destructive"
        });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please check your connection." });
      toast({
        title: "Connection Error",
        description: "Please check your internet connection and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Verify Your Email
          </CardTitle>
        <CardDescription className="text-slate-600">
            Welcome{userName ? `, ${userName}` : ''} ! Let’s finish setting up your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
               <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-slate-600">Password must include:</p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-2">
                    {passwordCriteria.length ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={passwordCriteria.length ? "text-green-700" : "text-slate-600"}>
                      Minimum 8 characters
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordCriteria.upper ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={passwordCriteria.upper ? "text-green-700" : "text-slate-600"}>
                      At least 1 uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordCriteria.lower ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={passwordCriteria.lower ? "text-green-700" : "text-slate-600"}>
                      At least 1 lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {passwordCriteria.digit ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={passwordCriteria.digit ? "text-green-700" : "text-slate-600"}>
                      At least 1 digit
                    </span>
                  </li>
                </ul>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email & Set Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setLocation('/login')}
              className="text-slate-600 hover:text-slate-900"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}