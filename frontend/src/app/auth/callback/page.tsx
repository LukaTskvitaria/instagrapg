"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Instagram, ArrowRight } from "lucide-react";

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    if (error || errorMessage) {
      setStatus('error');
      setMessage(decodeURIComponent(errorMessage || error || 'ავტორიზაციის შეცდომა'));
    } else if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        
        // Save token to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(userData));
        
        setStatus('success');
        setUserInfo(userData);
        setMessage('Instagram ანგარიში წარმატებით დაკავშირდა!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch {
        setStatus('error');
        setMessage('მონაცემების დამუშავების შეცდომა');
      }
    } else {
      setStatus('error');
      setMessage('არასრული ავტორიზაციის მონაცემები');
    }
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/auth');
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
              {status === 'loading' && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              )}
              {status === 'success' && (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            
            <CardTitle className="text-white">
              {status === 'loading' && 'ავტორიზაციის დამუშავება...'}
              {status === 'success' && 'წარმატება!'}
              {status === 'error' && 'შეცდომა'}
            </CardTitle>
            
            <CardDescription className="text-gray-400">
              {status === 'loading' && 'გთხოვთ დაელოდოთ, მიმდინარეობს Instagram ანგარიშის დაკავშირება'}
              {status === 'success' && 'თქვენი Instagram ანგარიში წარმატებით დაკავშირდა'}
              {status === 'error' && 'Instagram ანგარიშის დაკავშირებისას მოხდა შეცდომა'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status Message */}
            {message && (
              <Alert className={status === 'error' ? 'bg-red-900/50 border-red-800' : 'bg-green-900/50 border-green-800'}>
                <AlertDescription className={status === 'error' ? 'text-red-200' : 'text-green-200'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* Success - User Info */}
            {status === 'success' && userInfo && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{userInfo.name}</p>
                    <p className="text-gray-400 text-sm">{userInfo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === 'success' && (
                <>
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    დაშბორდზე გადასვლა
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    ავტომატურად გადამისამართება 3 წამში...
                  </p>
                </>
              )}
              
              {status === 'error' && (
                <Button 
                  onClick={handleRetry}
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  ხელახლა ცდა
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
              <CardTitle className="text-white">ავტორიზაციის დამუშავება...</CardTitle>
              <CardDescription className="text-gray-400">
                გთხოვთ დაელოდოთ, მიმდინარეობს Instagram ანგარიშის დაკავშირება
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
